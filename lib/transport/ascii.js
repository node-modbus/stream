var util          = require("util");
var buffer        = require("../buffer");
var BaseTransport = require("./transport");

var MESSAGE_START = buffer.from([ 0x3A ]);
var MESSAGE_END   = buffer.from([ 0x0D, 0x0A ]);

function Transport(stream, options) {
	options = options || {};

	BaseTransport.call(this, stream, options);

	this.callback        = null;
	this.callbackSlaveId = null;
	this.buffer          = null;
};
util.inherits(Transport, BaseTransport);

Transport.prototype.wrap = function (pdu, options, next) {
	options = options || {};
	next    = next || null;

	var slaveId = (typeof options.slaveId != "undefined" ? options.slaveId : 1);
	var data    = buffer.alloc((pdu.length + 1) * 2 + 2 + MESSAGE_START.length + MESSAGE_END.length);

	MESSAGE_START.copy(data, 0);
	MESSAGE_END.copy(data, data.length - MESSAGE_END.length);

	writeAscii(data, buffer.from([ slaveId ]), MESSAGE_START.length);
	writeAscii(data, pdu, MESSAGE_START.length + 2);

	if (typeof next == "function") {
		this.callback        = next;
		this.callbackSlaveId = slaveId;
	}

	writeAscii(data, Transport.lrc(Buffer.concat([ buffer.from([ slaveId ]), pdu ])), data.length - MESSAGE_END.length - 2);

	return data;
};

Transport.prototype.unwrap = function (data) {
	this.buffer = (this.buffer === null ? data : Buffer.concat([ this.buffer, data ]));

	if (buffer.length < MESSAGE_START.length + MESSAGE_END.length + 3) return false;

	var start = buffer.indexOf(this.buffer, MESSAGE_START);

	if (start == -1) return false;

	start += MESSAGE_START.length;

	var end = buffer.indexOf(this.buffer, MESSAGE_END, start);

	if (end == -1) return false;

	var temp      = buffer.from(this.buffer.slice(start, end).toString(), "hex");
	var unwrapped = {
		slaveId      : temp.readUInt8(0),
		crc          : temp.readUInt8(temp.length - 1),
		expected_crc : Transport.lrc(temp.slice(0, temp.length - 1)).readUInt8(0),
		pdu          : temp.slice(1, temp.length - 1),
		stream       : this.stream
	};

	if (typeof this.callback == "function") {
		if (unwrapped.slaveId != this.callbackSlaveId) return false;

		unwrapped.callback = this.callback;
		this.callback      = null;
	}

	end += MESSAGE_END.length;

	this.buffer = (end >= this.buffer.length ? null : this.buffer.slice(end));

	return unwrapped;
};

Transport.lrc = function (data) {
	var lrc = 0;

	for (var i = 0; i < data.length; i++) {
		lrc += data[i];
	}

	return buffer.from([ (0xFF - lrc + 1) ]);
};

Transport.prepare = function (options) {
	return function (stream) {
		return new Transport(stream, options);
	};
};

module.exports = Transport;

function writeAscii(buffer, block, offset) {
	for (var i = 0; i < block.length; i++) {
		var char = block[i].toString(16).toUpperCase();

		if (char.length < 2) {
			char = "0" + char;
		}

		buffer.writeUInt8(char.charCodeAt(0), offset + (i * 2));
		buffer.writeUInt8(char.charCodeAt(1), offset + (i * 2) + 1);
	}
}
