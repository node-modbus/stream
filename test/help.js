var util   = require("util");
var buffer = require("../lib/buffer");
var Duplex = require("stream").Duplex;

exports.stream = function () {
	return new EmptyStream;
};

exports.tests = function () {
	return require("./tests");
};

exports.tcp_header = function (pdu, transactionId, protocol, unitId) {
	var header = buffer.alloc(7);

	if (typeof transactionId == "undefined") transactionId = 0;
	if (typeof protocol == "undefined")      protocol      = 0;
	if (typeof unitId == "undefined")        unitId        = 1;

	header.writeUInt16BE(transactionId, 0);
	header.writeUInt16BE(protocol, 2);
	header.writeUInt16BE(pdu.length + 1, 4);
	header.writeUInt8(unitId, 6);

	return header;
};

exports.serial_header = function (slaveId) {
	if (typeof slaveId == "undefined") slaveId = 1;

	return buffer.from([ slaveId ]);
};

exports.ascii_wrap = function (slaveId, pdu) {
	var start  = buffer.from([ 0x3A ]);
	var end    = buffer.from([ 0x0D, 0x0A ]);
	var header = buffer.alloc((pdu.length + 1) * 2 + 2 + start.length + end.length);

	start.copy(header, 0);
	end.copy(header, header.length - end.length);

	writeAscii(header, buffer.from([ slaveId ]), start.length);
	writeAscii(header, pdu, start.length + 2);
	writeAscii(header, exports.modbus.transports.ascii.lrc(Buffer.concat([ buffer.from([ slaveId ]), pdu ])), header.length - end.length - 2);

	return header;
};

exports.print_buffer = function (buf) {
	return "<" + buffer.values(buf).map(function (v) { return (v < 16 ? "0" : "") + v.toString(16); }).join(" ") + ">";
};

exports.modbus = require("../");
exports.buffer = buffer;

function EmptyStream(options) {
	Duplex.call(this, options);
}

util.inherits(EmptyStream, Duplex);

EmptyStream.prototype._write = function (chunk, encoding, callback) {
	callback();
};

EmptyStream.prototype._read = function (size) {
	this.push(buffer.alloc(0));
};

function writeAscii(header, block, offset) {
	for (var i = 0; i < block.length; i++) {
		var char = block[i].toString(16).toUpperCase();

		if (char.length < 2) {
			char = "0" + char;
		}

		header.writeUInt8(char.charCodeAt(0), offset + (i * 2));
		header.writeUInt8(char.charCodeAt(1), offset + (i * 2) + 1);
	}
}
