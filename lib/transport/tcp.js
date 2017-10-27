var util          = require("util");
var buffer        = require("../buffer");
var BaseTransport = require("./transport");

function Transport(stream, options) {
	options = options || {};

	BaseTransport.call(this, stream, options);

	var transport     = this;

	this.transactionId = (typeof options.transactionId != "undefined" ? options.transactionId : 1) - 1;
	this.unitId        = (typeof options.unitId != "undefined" ? options.unitId : 1);
	this.protocol      = (typeof options.protocol != "undefined" ? options.protocol : 0);
	this.callbacks     = {};
	this.buffer        = null;

	this.stream.on("end", function () {
		transport.emit("close");
	});
}
util.inherits(Transport, BaseTransport);

Transport.prototype.wrap = function (pdu, options, next) {
	options = options || {};
	next    = next || null;

	var unitId        = (typeof options.unitId != "undefined" ? options.unitId : this.unitId);
	var transactionId = (typeof options.transactionId != "undefined" ? options.transactionId : null);
	var data          = buffer.alloc(pdu.length + 7);

	if (transactionId !== null) {
		data.writeUInt16BE(transactionId, 0);
	} else {
		this.transactionId += 1;

		if (this.transactionId > 65535) {
			this.transactionId = 1;
		}

		data.writeUInt16BE(this.transactionId, 0);
	}

	if (typeof next == "function") {
		var key = [ data.readUInt16BE(0), unitId, pdu.readUInt8(0) ].join(":");

		this.callbacks[key] = next;

		data.__callback_key = key;
	}

	data.writeUInt16BE(this.protocol, 2);
	data.writeUInt16BE(pdu.length + 1, 4);
	data.writeUInt8(unitId, 6);

	pdu.copy(data, 7);

	return data;
};

Transport.prototype.close = function (next) {
	this.closed = true;

	this.stream.end(next);
};

Transport.prototype.pending = function () {
	return (this.buffer !== null && this.buffer.length);
};

Transport.prototype.unwrap = function (data) {
	this.buffer = (this.buffer === null ? data : buffer.concat([ this.buffer, data ]));

	// not enough data to see package length
	if (this.buffer.length < 6) return false;

	var length = this.buffer.readUInt16BE(4);

	if (this.buffer.length < length + 6) return false;

	var unwrapped = {
		transactionId : this.buffer.readUInt16BE(0),
		protocol      : this.buffer.readUInt16BE(2),
		length        : length,
		unitId        : this.buffer.readUInt8(6),
		pdu           : this.buffer.slice(7, length + 6),
		stream        : this.stream
	};
	unwrapped.__callback_key = [ unwrapped.transactionId, unwrapped.unitId, unwrapped.pdu.readUInt8(0) & 0x7F ].join(":");

	if (typeof this.callbacks[unwrapped.__callback_key] == "function") {
		unwrapped.callback = this.callbacks[unwrapped.__callback_key];
		delete this.callbacks[unwrapped.__callback_key];
	}

	this.buffer = (this.buffer.length > length + 6 ? this.buffer.slice(length + 6) : null);

	return unwrapped;
};

Transport.prepare = function (options) {
	return function (stream) {
		return new Transport(stream, options);
	};
};

module.exports = Transport;
