const net    = require("net");
const stream = require("../stream");

class Transport {
	constructor () {
		this.callback = null;
	}
	wrap (pdu, options = {}, next = null) {
		const { slaveId = 1 } = options;

		var buffer = Buffer.alloc(pdu.length + 3);

		buffer.writeUInt8(slaveId, 0);
		buffer.writeUInt16LE(Transport.crc16(Buffer.concat([ Buffer.from([ slaveId ]), pdu ])), pdu.length + 1);

		if (typeof next == "function") {
			this.callback = next;
		}

		pdu.copy(buffer, 1);

		return buffer;
	}
	unwrap (data) {
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
	}
	static crc16(buffer) {
		var crc = 0xFFFF;

		for (let i = 0; i < buffer.length; i++) {
			crc ^= buffer[i];

			for (let j = 8; j != 0; j--) {
				if ((crc & 0x0001) != 0) {
					crc >>= 1;
					crc ^= 0xA001;
				} else {
					crc >>= 1;
				}
			}
		}

		return crc;
	}

	static connect (port = 502, host = "localhost", options = {}, next) {
		if (typeof options == "function") {
			next    = options;
			options = {};

			if (typeof host == "object") {
				options = host;
				host    = "localhost";
			}
		} else if (typeof host == "function") {
			next = host;
			host = "localhost";
		}

		var socket = net.connect(port, host, () => {
			return next(null, new stream(new Transport(), socket, options));
		});

		return socket;
	}
	static server (options = {}, next) {
		if (typeof options == "function") {
			next    = options;
			options = {};
		}

		return net.createServer((socket) => {
			return next(new stream(new Transport(), socket, options));
		});
	}
}

module.exports = Transport;
