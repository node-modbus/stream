class Transport {
	constructor (options = {}) {
		const { transactionId = 1, protocol = 0 } = options;

		this.transactionId = transactionId - 1;
		this.protocol      = protocol;
		this.buffer        = null;
	}
	write (data) {
		return this.stream.write(data);
	}
	wrap (pdu, options = {}) {
		const { unitId = 1, transactionId = null } = options;

		var buffer = Buffer.alloc(pdu.length + 7);

		if (transactionId !== null) {
			buffer.writeUInt16BE(transactionId, 0);
		} else {
			this.transactionId += 1;

			buffer.writeUInt16BE(this.transactionId, 0);
		}

		buffer.writeUInt16BE(this.protocol, 2);
		buffer.writeUInt16BE(pdu.length + 1, 4);
		buffer.writeUInt8(unitId, 6);

		pdu.copy(buffer, 7);

		return buffer;
	}
	unwrap (data) {
		this.buffer = (this.buffer === null ? data : Buffer.concat([ this.buffer, data ]));

		// not enough data to see package length
		if (this.buffer.length < 6) return false;

		const length = this.buffer.readUInt16BE(4);

		if (this.buffer.length - length - 6) return false;

		var unwrapped = {
			transactionId : this.buffer.readUInt16BE(0),
			protocol      : this.buffer.readUInt16BE(2),
			length        : length,
			unitId        : this.buffer.readUInt8(6),
			pdu           : this.buffer.slice(7, length + 6)
		};

		this.buffer = (this.buffer.length > length + 6 ? this.buffer.slice(length + 6) : null);

		return unwrapped;
	}
}

module.exports = Transport;
