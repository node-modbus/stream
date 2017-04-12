const BaseTransport = require("./transport");

const MESSAGE_START = Buffer.from([ 0x3A ]);
const MESSAGE_END   = Buffer.from([ 0x0D, 0x0A ]);

class Transport extends BaseTransport {
	constructor (stream, options = {}) {
		super(stream, options);

		this.callback = null;
		this.buffer   = null;
	}
	wrap (pdu, options = {}, next = null) {
		const { slaveId = 1 } = options;

		var buffer = Buffer.alloc((pdu.length + 1) * 2 + 2 + MESSAGE_START.length + MESSAGE_END.length);

		MESSAGE_START.copy(buffer, 0);
		MESSAGE_END.copy(buffer, buffer.length - MESSAGE_END.length);

		writeAscii(buffer, Buffer.from([ slaveId ]), MESSAGE_START.length);
		writeAscii(buffer, pdu, MESSAGE_START.length + 2);

		if (typeof next == "function") {
			this.callback = next;
		}

		writeAscii(buffer, Transport.lrc(Buffer.concat([ Buffer.from([ slaveId ]), pdu ])), buffer.length - MESSAGE_END.length - 2);

		return buffer;
	}
	unwrap (data) {
		this.buffer = (this.buffer === null ? data : Buffer.concat([ this.buffer, data ]));

		var start = this.buffer.indexOf(MESSAGE_START);

		if (start == -1) return false;

		start += MESSAGE_START.length;

		var end = this.buffer.indexOf(MESSAGE_END, start);

		if (end == -1) return false;

		var buffer    = Buffer.from(this.buffer.slice(start, end).toString(), "hex");
		var unwrapped = {
			slaveId      : buffer.readUInt8(0),
			crc          : buffer.readUInt8(buffer.length - 1),
			expected_crc : Transport.lrc(buffer.slice(0, buffer.length - 1)).readUInt8(0),
			pdu          : buffer.slice(1, buffer.length - 1)
		};

		if (typeof this.callback == "function") {
			unwrapped.callback = this.callback;
		}

		end += MESSAGE_END.length;

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
