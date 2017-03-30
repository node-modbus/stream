const serialport    = require("serialport");
const stream        = require("../stream");
const BaseTransport = require("./transport");

const START_MSG = Buffer.from([ 0x3A ]);
const END_MSG   = Buffer.from([ 0x0D, 0x0A ]);

class Transport extends BaseTransport {
	constructor (stream) {
		super(stream);

		this.callback = null;
		this.buffer   = null;
	}
	wrap (pdu, options = {}, next = null) {
		const { slaveId = 1 } = options;

		var buffer = Buffer.alloc((pdu.length + 1) * 2 + 2 + START_MSG.length + END_MSG.length);

		START_MSG.copy(buffer, 0);
		END_MSG.copy(buffer, buffer.length - END_MSG.length);

		writeAscii(buffer, Buffer.from([ slaveId ]), START_MSG.length);
		writeAscii(buffer, pdu, START_MSG.length + 2);

		if (typeof next == "function") {
			this.callback = next;
		}

		writeAscii(buffer, Transport.lrc(Buffer.concat([ Buffer.from([ slaveId ]), pdu ])), buffer.length - END_MSG.length - 2);

		return buffer;
	}
	unwrap (data) {
		this.buffer = (this.buffer === null ? data : Buffer.concat([ this.buffer, data ]));

		var start = this.buffer.indexOf(START_MSG);

		if (start == -1) return false;

		start += START_MSG.length;

		var end = this.buffer.indexOf(END_MSG, start);

		if (end == -1) return false;

		var buffer    = Buffer.from(this.buffer.slice(start, end).toString(), "hex");
		var unwrapped = {
			slaveId      : buffer.readUInt8(0),
			lrc          : buffer.readUInt8(buffer.length - 1),
			expected_lrc : Transport.lrc(buffer.slice(0, buffer.length - 1)).readUInt8(0),
			pdu          : buffer.slice(1, buffer.length - 1)
		};

		if (typeof this.callback == "function") {
			unwrapped.callback = this.callback;
		}

		end += END_MSG.length;

		this.buffer = (end >= this.buffer.length ? null : this.buffer.slice(end));

		return unwrapped;
	}
	static lrc(buffer) {
		var lrc = 0;

		for (let i = 0; i < buffer.length; i++) {
			lrc += buffer[i];
		}

		return Buffer.from([ (0xFF - lrc + 1) ]);
	}

	static connect (device = "/tmp/modbus.sock", options = {}, next) {
		if (typeof options == "function") {
			next    = options;
			options = {};
		}

		var port = new serialport(device, {
			baudRate : options.baudRate || 9600,
			dataBits : options.dataBits || 8,
			stopBits : options.stopBits || 1,
			parity   : options.parity   || "none"
		}, (err) => {
			if (err) return next(err);

			return next(null, new stream(new Transport(port), options));
		});

		return port;
	}
}

module.exports = Transport;

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
