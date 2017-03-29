const util   = require("util");
const events = require("events");
const pdu    = require("modbus-pdu");

class Stream {
	constructor (transport, stream, { debug = null }) {
		this.events    = new events();
		this.transport = transport;
		this.responses = {};
		this.stream    = stream;

		if (debug !== null) {
			this.debugger = (mode, data) => {
				let [ ...bytes ] = data.values();

				process.stderr.write(util.format("%s %s 0x[ %s ]\n", mode, debug, bytes.map((byte) => (padStart(byte.toString(16).toUpperCase(), 2, "0"))).join(", ") ));
			};
		} else {
			this.debugger = false;
		}

		this.stream.on("data", (data) => {
			if (typeof this.debugger == "function") {
				this.debugger(">>", data);
			}

			let info = this.transport.unwrap(data);

			if (info.transactionId && typeof this.responses[info.transactionId] == "function") {
				try {
					info.response = pdu.Response(info.pdu);

					this.responses[info.transactionId](null, info);

					delete this.responses[info.transactionId];
				} catch (err) {
					this.events.emit("error", err);
				}
			} else {
				try {
					info.request = pdu.Request(info.pdu);

					let event_name = info.request.code.replace(/(.)([A-Z])/g, (m, b, l) => (b + "-" + l)).toLowerCase();

					this.events.emit(event_name, info, (err, ...data) => {
						const response = this.transport.wrap(pdu[info.request.code].Response.build(...data), info);

						this.write(response);
					});
				} catch (err) {
					this.events.emit("error", err);
				}
			}
		});
	}
	write (data) {
		if (typeof this.debugger == "function") {
			this.debugger("<<", data);
		}
		this.stream.write(data);
	}
	// function code 0x01
	readCoils ({ from = 0, to = 0, extra = {} }, next = null) {
		this.__readSingle("ReadCoils", from, to, extra, next);
	}
	// function code 0x02
	readDiscreteInputs ({ from = 0, to = 0, extra = {} }, next = null) {
		this.__readSingle("ReadDiscreteInputs", from, to, extra, next);
	}
	// function code 0x03
	readHoldingRegisters ({ from = 0, to = 0, extra = {} }, next = null) {
		this.__readSingle("ReadHoldingRegisters", from, to, extra, next);
	}
	// function code 0x04
	readInputRegisters ({ from = 0, to = 0, extra = {} }, next = null) {
		this.__readSingle("ReadInputRegisters", from, to, extra, next);
	}
	// function code 0x05
	writeSingleCoil ({ address = 0, value = 0, extra = {} }, next = null) {
		this.__writeSingle("WriteSingleCoil", address, value, extra, next);
	}
	// function code 0x06
	writeSingleRegister ({ address = 0, value = Buffer.from([ 0, 0 ]), extra = {} }, next = null) {
		this.__writeSingle("WriteSingleRegister", address, value, extra, next);
	}
	// function code 0x0F
	writeMultipleCoils ({ address = 0, values = [], extra = {} }, next = null) {
		this.__writeMultiple("WriteMultipleCoils", address, values, extra, next);
	}
	// function code 0x10
	writeMultipleRegisters ({ address = 0, values = [ Buffer.from([ 0, 0 ]) ], extra = {} }, next = null) {
		this.__writeMultiple("WriteMultipleRegisters", address, values, extra, next);
	}
	readDeviceIdentification (extra = {}, next = null) {
		if (typeof extra == "function") {
			next  = extra;
			extra = {};
		}

		this.write(this.transport.wrap(pdu.ReadDeviceIdentification.Request.build(), extra));

		if (typeof next == "function") {
			this.responses[this.transport.transactionId] = next;
		}
	}
	__readSingle (fcode, from, to, extra, next) {
		this.write(this.transport.wrap(pdu[fcode].Request.build(from, to), extra));

		if (typeof next == "function") {
			this.responses[this.transport.transactionId] = next;
		}
	}
	__writeSingle (fcode, address, value, extra, next) {
		this.write(this.transport.wrap(pdu[fcode].Request.build(address, value), extra));

		if (typeof next == "function") {
			this.responses[this.transport.transactionId] = next;
		}
	}
	__writeMultiple (fcode, address, values, extra, next) {
		console.log(pdu[fcode].Request.build(address, values));
		this.write(this.transport.wrap(pdu[fcode].Request.build(address, values), extra));

		if (typeof next == "function") {
			this.responses[this.transport.transactionId] = next;
		}
	}
}

module.exports = Stream;

function padStart(str, len, c = " ") {
	len = len >> 0;

	if (str.length > len) return str;

	len = len - str.length;
	if (len > c.length) {
		c += c.repeat(len / c.length);
	}

	return c.slice(0, len) + str;
}
