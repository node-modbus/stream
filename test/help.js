const Duplex = require("stream").Duplex;

exports.stream = function () {
	return new EmptyStream;
};

exports.tests = function () {
	return require("./tests");
};

exports.tcp_header = function (pdu, transactionId = 0, protocol = 0, unitId = 1) {
	var buffer = Buffer.alloc(7);

	buffer.writeUInt16BE(transactionId, 0);
	buffer.writeUInt16BE(protocol, 2);
	buffer.writeUInt16BE(pdu.length + 1, 4);
	buffer.writeUInt8(unitId, 6);

	return buffer;
};

exports.serial_header = function (slaveId = 1) {
	return Buffer.from([ slaveId ]);
};

exports.ascii_wrap = function (slaveId, pdu) {
	var start  = Buffer.from([ 0x3A ]);
	var end    = Buffer.from([ 0x0D, 0x0A ]);
	var buffer = Buffer.alloc((pdu.length + 1) * 2 + 2 + start.length + end.length);

	start.copy(buffer, 0);
	end.copy(buffer, buffer.length - end.length);

	writeAscii(buffer, Buffer.from([ slaveId ]), start.length);
	writeAscii(buffer, pdu, start.length + 2);
	writeAscii(buffer, exports.modbus.transports.ascii.lrc(Buffer.concat([ Buffer.from([ slaveId ]), pdu ])), buffer.length - end.length - 2);

	return buffer;
};

exports.print_buffer = function (buffer) {
	return "<" + [ ... buffer.values() ].map((v) => ((v < 16 ? "0" : "") + v.toString(16))).join(" ") + ">";
};

exports.modbus = require("../");

class EmptyStream extends Duplex {
	constructor(options) {
		super(options);
	}

	_write (chunk, encoding, callback) {
		callback();
	}

	_read (size) {
		this.push(Buffer.alloc(0));
	}
}

function writeAscii(buffer, block, offset) {
	for (var i = 0; i < block.length; i++) {
		let char = block[i].toString(16).toUpperCase();

		if (char.length < 2) {
			char = "0" + char;
		}

		buffer.writeUInt8(char.charCodeAt(0), offset + (i * 2));
		buffer.writeUInt8(char.charCodeAt(1), offset + (i * 2) + 1);
	}
}
