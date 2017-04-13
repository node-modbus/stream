var util          = require("util");
var BaseTransport = require("./transport");

function Transport(stream, options) {
	options = options || {};

	BaseTransport.call(this, stream, options);

	this.callback = null;
};
util.inherits(Transport, BaseTransport);

Transport.prototype.wrap = function (pdu, options, next) {
	options = options || {};
	next    = next || null;

	var slaveId = (typeof options.slaveId != "undefined" ? options.slaveId : 1);
	var buffer  = Buffer.alloc(pdu.length + 3);

	buffer.writeUInt8(slaveId, 0);

	if (typeof next == "function") {
		this.callback = next;
	}

	pdu.copy(buffer, 1);

	buffer.writeUInt16LE(Transport.crc16(buffer.slice(0, buffer.length - 2)), pdu.length + 1);

	return buffer;
};

Transport.prototype.unwrap = function (data) {
	var unwrapped = {
		slaveId      : data.readUInt8(0),
		crc          : data.readUInt16LE(data.length - 2),
		expected_crc : Transport.crc16(data.slice(0, data.length - 2)),
		pdu          : data.slice(1, data.length - 2)
	};

	if (typeof this.callback == "function") {
		unwrapped.callback = this.callback;
	}

	return unwrapped;
};

Transport.crc16 = function (buffer) {
	var crc = 0xFFFF;

	for (var i = 0; i < buffer.length; i++) {
		crc ^= buffer[i];

		for (var j = 8; j != 0; j--) {
			if ((crc & 0x0001) != 0) {
				crc >>= 1;
				crc ^= 0xA001;
			} else {
				crc >>= 1;
			}
		}
	}

	return crc;
};

module.exports = Transport;
