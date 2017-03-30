const util         = require("util");
const EventEmitter = require("events");

class Stream extends EventEmitter {
	constructor (transport, { debug = null }) {
		super();

		this.transport = transport;

		if (debug !== null) {
			this.debugger = (mode, data) => {
				let [ ...bytes ] = data.values();

				process.stderr.write(util.format("%s %s 0x[ %s ]\n", mode, debug, bytes.map((byte) => (padStart(byte.toString(16).toUpperCase(), 2, "0"))).join(", ") ));
			};

			this.transport.on("incoming-data", (data) => {
				this.debugger(">>", data);
			});
			this.transport.on("outgoing-data", (data) => {
				this.debugger("<<", data);
			});
		} else {
			this.debugger = false;
		}

		this.transport.on("error", (error) => {
			this.emit("error", error);
		});

		this.transport.on("request", (fcode, req, reply) => {
			this.emit(fcode, req, reply);
		});
	}
	write (data) {
		this.transport.write(data);
	}
	// function code 0x01
	readCoils ({ address = 0, quantity = 1, extra = {} }, next = null) {
		this.transport.send("ReadCoils", extra, next, address, quantity);
	}
	// function code 0x02
	readDiscreteInputs ({ address = 0, quantity = 1, extra = {} }, next = null) {
		this.transport.send("ReadDiscreteInputs", extra, next, address, quantity);
	}
	// function code 0x03
	readHoldingRegisters ({ address = 0, quantity = 1, extra = {} }, next = null) {
		this.transport.send("ReadHoldingRegisters", extra, next, address, quantity);
	}
	// function code 0x04
	readInputRegisters ({ address = 0, quantity = 1, extra = {} }, next = null) {
		this.transport.send("ReadInputRegisters", extra, next, address, quantity);
	}
	// function code 0x05
	writeSingleCoil ({ address = 0, value = 0, extra = {} }, next = null) {
		this.transport.send("WriteSingleCoil", extra, next, address, value);
	}
	// function code 0x06
	writeSingleRegister ({ address = 0, value = Buffer.from([ 0, 0 ]), extra = {} }, next = null) {
		this.transport.send("WriteSingleRegister", extra, next, address, value);
	}
	// function code 0x07
	readExceptionStatus ({ extra = {} }, next = null) {
		this.transport.send("ReadExceptionStatus", extra, next);
	}
	// function code 0x0B
	getCommEventCounter ({ extra = {} }, next = null) {
		this.transport.send("GetCommEventCounter", extra, next);
	}
	// function code 0x0C
	getCommEventLog ({ extra = {} }, next = null) {
		this.transport.send("GetCommEventLog", extra, next);
	}
	// function code 0x0F
	writeMultipleCoils ({ address = 0, values = [], extra = {} }, next = null) {
		this.transport.send("WriteMultipleCoils", extra, next, address, values);
	}
	// function code 0x10
	writeMultipleRegisters ({ address = 0, values = [ Buffer.from([ 0, 0 ]) ], extra = {} }, next = null) {
		this.transport.send("WriteMultipleRegisters", extra, next, address, values);
	}
	// function code 0x14
	readFileRecord ({ requests = [], extra = {} }, next = null) {
		this.transport.send("ReadFileRecord", extra, next, requests);
	}
	// function code 0x15
	writeFileRecord ({ requests = [], extra = {} }, next = null) {
		this.transport.send("WriteFileRecord", extra, next, requests);
	}
	// function code 0x16
	maskWriteRegister ({ address = 0, andmask = 0xFFFF, ormask = 0x0000, extra = {} }, next = null) {
		this.transport.send("MaskWriteRegister", extra, next, address, andmask, ormask);
	}
	// function code 0x17
	readWriteMultipleRegisters ({ read_address = 0, read_quantity = 1, write_address = 0, values = [ Buffer.from([ 0, 0 ]) ], extra = {} }, next = null) {
		this.transport.send("ReadWriteMultipleRegisters", extra, next, read_address, read_quantity, write_address, values);
	}
	// function code 0x18
	readFifoQueue ({ address = 0, extra = {} }, next = null) {
		this.transport.send("ReadFifoQueue", extra, next, address);
	}
	// function code 0x2B / 0x0E
	readDeviceIdentification ({ type = "BasicDeviceIdentification", id = "ProductName", extra = {} }, next = null) {
		this.transport.send("ReadDeviceIdentification", extra, next, type, id);
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
