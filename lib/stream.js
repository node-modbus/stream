const util   = require("util");
const events = require("events");
const pdu    = require("modbus-pdu");

class Stream {
	constructor (transport, stream, { debug = null }) {
		this.events    = new events();
		this.transport = transport;
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

			if (typeof info.callback == "function") {
				try {
					info.response = pdu.Response(info.pdu);

					if (typeof info.response.exception != "undefined") {
						info.callback(new Error(info.response.exception), info);
					} else {
						info.callback(null, info);
					}

					delete info.callback;
				} catch (err) {
					this.events.emit("error", err);
				}
			} else {
				try {
					info.request = pdu.Request(info.pdu);

					let event_name = info.request.code.replace(/(.)([A-Z])/g, (m, b, l) => (b + "-" + l)).toLowerCase();

					this.events.emit(event_name, info, (err, ...data) => {
						if (err instanceof Error) {
							return this.write(
								this.transport.wrap(
									pdu[info.request.code].Exception.build(err.code || +err.message)
								)
							);
						}

						this.write(
							this.transport.wrap(
								pdu[info.request.code].Response.build(...data),
								info
							)
						);
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
	readCoils ({ address = 0, quantity = 1, extra = {} }, next = null) {
		this.write(this.transport.wrap(pdu.ReadCoils.Request.build(address, quantity), extra, next));
	}
	// function code 0x02
	readDiscreteInputs ({ address = 0, quantity = 1, extra = {} }, next = null) {
		this.write(this.transport.wrap(pdu.ReadDiscreteInputs.Request.build(address, quantity), extra, next));
	}
	// function code 0x03
	readHoldingRegisters ({ address = 0, quantity = 1, extra = {} }, next = null) {
		this.write(this.transport.wrap(pdu.readHoldingRegisters.Request.build(address, quantity), extra, next));
	}
	// function code 0x04
	readInputRegisters ({ address = 0, quantity = 1, extra = {} }, next = null) {
		this.write(this.transport.wrap(pdu.readInputRegisters.Request.build(address, quantity), extra, next));
	}
	// function code 0x05
	writeSingleCoil ({ address = 0, value = 0, extra = {} }, next = null) {
		this.write(this.transport.wrap(pdu.WriteSingleCoil.Request.build(address, value), extra, next));
	}
	// function code 0x06
	writeSingleRegister ({ address = 0, value = Buffer.from([ 0, 0 ]), extra = {} }, next = null) {
		this.write(this.transport.wrap(pdu.WriteSingleRegister.Request.build(address, value), extra, next));
	}
	// function code 0x0F
	writeMultipleCoils ({ address = 0, values = [], extra = {} }, next = null) {
		this.write(this.transport.wrap(pdu.WriteMultipleCoils.Request.build(address, values), extra, next));
	}
	// function code 0x10
	writeMultipleRegisters ({ address = 0, values = [ Buffer.from([ 0, 0 ]) ], extra = {} }, next = null) {
		this.write(this.transport.wrap(pdu.WriteMultipleRegisters.Request.build(address, values), extra, next));
	}
	// function code 0x14
	readFileRecord ({ requests = [], extra = {} }, next = null) {
		this.write(this.transport.wrap(pdu.ReadFileRecord.Request.build(requests), extra, next));
	}
	// function code 0x15
	writeFileRecord ({ requests = [], extra = {} }, next = null) {
		this.write(this.transport.wrap(pdu.WriteFileRecord.Request.build(requests), extra, next));
	}
	// function code 0x16
	maskWriteRegister ({ address = 0, andmask = 0xFFFF, ormask = 0x0000, extra = {} }, next = null) {
		this.write(this.transport.wrap(pdu.MaskWriteRegister.Request.build(address, andmask, ormask), extra, next));
	}
	// function code 0x18
	readFifoQueue ({ address = 0, extra = {} }, next = null) {
		this.write(this.transport.wrap(pdu.ReadFifoQueue.Request.build(address), extra, next));
	}
	// function code 0x2B
	readDeviceIdentification ({ type = "BasicDeviceIdentification", id = "ProductName", extra = {} }, next = null) {
		this.write(this.transport.wrap(pdu.ReadDeviceIdentification.Request.build(type, id), extra, next));
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
