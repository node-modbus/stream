var util         = require("util");
var buffer       = require("./buffer");
var EventEmitter = require("events").EventEmitter;

function Stream(transport, options) {
	EventEmitter.call(this);

	options = options || {};

	this.transport = transport;

	var stream = this;

	if (options.debug !== null) {
		this.debugger = function (mode, data) {
			var bytes = buffer.values(data);

			if (options.debugdate === false) {
				process.stderr.write(util.format("%s %s 0x[ %s ]\n", mode, options.debug, bytes.map(function (byte) { return padStart(byte.toString(16).toUpperCase(), 2, "0"); }).join(", ") ));
			} else {
				process.stderr.write(util.format("%s %s %s 0x[ %s ]\n", (new Date).toISOString(), mode, options.debug, bytes.map(function (byte) { return padStart(byte.toString(16).toUpperCase(), 2, "0"); }).join(", ") ));
			}
		};

		this.transport.on("incoming-data", function (data) {
			stream.debugger(options.debuginvert ? "<<" : ">>", data);
		});
		this.transport.on("outgoing-data", function (data) {
			stream.debugger(options.debuginvert ? ">>" : "<<", data);
		});
	} else {
		this.debugger = false;
	}

	this.transport.on("error", function (error) {
		stream.emit("error", error);
	});

	this.transport.on("close", function () {
		stream.emit("close");
	});

	this.transport.on("request", function (fcode, req, reply) {
		stream.emit(fcode, req, reply);
	});
}
util.inherits(Stream, EventEmitter);

Stream.prototype.close = function (next) {
	this.transport.close(next);
};

Stream.prototype.write = function (data, options, next) {
	if (typeof options == "function") {
		next    = options;
		options = {};
	}

	this.transport.write(this.transport.wrap(data, options, next));
};
// function code 0x01
Stream.prototype.readCoils = function (options, next) {
	options = options || {};

	var address  = (typeof options.address != "undefined" ? options.address : 0);
	var quantity = (typeof options.quantity != "undefined" ? options.quantity : 1);
	var extra    = options.extra || {};
	var next     = next || null;

	this.transport.send("ReadCoils", extra, next, address, quantity);
};
// function code 0x02
Stream.prototype.readDiscreteInputs = function (options, next) {
	options = options || {};

	var address  = (typeof options.address != "undefined" ? options.address : 0);
	var quantity = (typeof options.quantity != "undefined" ? options.quantity : 1);
	var extra    = options.extra || {};
	var next     = next || null;

	this.transport.send("ReadDiscreteInputs", extra, next, address, quantity);
};
// function code 0x03
Stream.prototype.readHoldingRegisters = function (options, next) {
	options = options || {};

	var address  = (typeof options.address != "undefined" ? options.address : 0);
	var quantity = (typeof options.quantity != "undefined" ? options.quantity : 1);
	var extra    = options.extra || {};
	var next     = next || null;

	this.transport.send("ReadHoldingRegisters", extra, next, address, quantity);
};
// function code 0x04
Stream.prototype.readInputRegisters = function (options, next) {
	options = options || {};

	var address  = (typeof options.address != "undefined" ? options.address : 0);
	var quantity = (typeof options.quantity != "undefined" ? options.quantity : 1);
	var extra    = options.extra || {};
	var next     = next || null;

	this.transport.send("ReadInputRegisters", extra, next, address, quantity);
};
// function code 0x05
Stream.prototype.writeSingleCoil = function (options, next) {
	options = options || {};

	var address = (typeof options.address != "undefined" ? options.address : 0);
	var value   = (typeof options.value != "undefined" ? options.value : 0);
	var extra   = options.extra || {};
	var next    = next || null;

	this.transport.send("WriteSingleCoil", extra, next, address, value);
};
// function code 0x06
Stream.prototype.writeSingleRegister = function (options, next) {
	options = options || {};

	var address = (typeof options.address != "undefined" ? options.address : 0);
	var value   = (typeof options.value != "undefined" ? options.value : buffer.from([ 0, 0 ]));
	var extra   = options.extra || {};
	var next    = next || null;

	this.transport.send("WriteSingleRegister", extra, next, address, value);
};
// function code 0x07
Stream.prototype.readExceptionStatus = function (options, next) {
	options = options || {};

	var extra = options.extra || {};
	var next  = next || null;

	this.transport.send("ReadExceptionStatus", extra, next);
};
// function code 0x0B
Stream.prototype.getCommEventCounter = function (options, next) {
	options = options || {};

	var extra = options.extra || {};
	var next  = next || null;

	this.transport.send("GetCommEventCounter", extra, next);
};
// function code 0x0C
Stream.prototype.getCommEventLog = function (options, next) {
	options = options || {};

	var extra = options.extra || {};
	var next  = next || null;

	this.transport.send("GetCommEventLog", extra, next);
};
// function code 0x0F
Stream.prototype.writeMultipleCoils = function (options, next) {
	options = options || {};

	var address = (typeof options.address != "undefined" ? options.address : 0);
	var values  = (typeof options.values != "undefined" ? options.values : []);
	var extra   = options.extra || {};
	var next    = next || null;

	this.transport.send("WriteMultipleCoils", extra, next, address, values);
};
// function code 0x10
Stream.prototype.writeMultipleRegisters = function (options, next) {
	options = options || {};

	var address = (typeof options.address != "undefined" ? options.address : 0);
	var values  = (typeof options.values != "undefined" ? options.values : buffer.from([ 0, 0 ]));
	var extra   = options.extra || {};
	var next    = next || null;

	this.transport.send("WriteMultipleRegisters", extra, next, address, values);
};
// function code 0x14
Stream.prototype.readFileRecord = function (options, next) {
	options = options || {};

	var requests = options.requests || [];
	var extra    = options.extra || {};
	var next     = next || null;

	this.transport.send("ReadFileRecord", extra, next, requests);
};
// function code 0x15
Stream.prototype.writeFileRecord = function (options, next) {
	options = options || {};

	var requests = options.requests || [];
	var extra    = options.extra || {};
	var next     = next || null;

	this.transport.send("WriteFileRecord", extra, next, requests);
};
// function code 0x16
Stream.prototype.maskWriteRegister = function (options, next) {
	options = options || {};

	var address = (typeof options.address != "undefined" ? options.address : 0);
	var andmask = (typeof options.andmask != "undefined" ? options.andmask : 0xFFFF);
	var ormask  = (typeof options.ormask != "undefined" ? options.ormask : 0x0000);
	var extra   = options.extra || {};
	var next    = next || null;

	this.transport.send("MaskWriteRegister", extra, next, address, andmask, ormask);
};
// function code 0x17
Stream.prototype.readWriteMultipleRegisters = function (options, next) {
	options = options || {};

	var read_address  = (typeof options.read_address != "undefined" ? options.read_address : 0);
	var read_quantity = (typeof options.read_quantity != "undefined" ? options.read_quantity : 1);
	var write_address = (typeof options.write_address != "undefined" ? options.write_address : 0);
	var values        = (typeof options.values != "undefined" ? options.values : buffer.from([ 0, 0 ]));
	var extra         = options.extra || {};
	var next          = next || null;

	this.transport.send("ReadWriteMultipleRegisters", extra, next, read_address, read_quantity, write_address, values);
};
// function code 0x18
Stream.prototype.readFifoQueue = function (options, next) {
	options = options || {};

	var address = (typeof options.address != "undefined" ? options.address : 0);
	var extra   = options.extra || {};
	var next    = next || null;

	this.transport.send("ReadFifoQueue", extra, next, address);
};
// function code 0x2B / 0x0E
Stream.prototype.readDeviceIdentification = function (options, next) {
	options = options || {};

	var type  = (typeof options.type != "undefined" ? options.type : "BasicDeviceIdentification");
	var id    = (typeof options.id != "undefined" ? options.id : "ProductName");
	var extra = options.extra || {};
	var next  = next || null;

	this.transport.send("ReadDeviceIdentification", extra, next, type, id);
};

module.exports = Stream;

function padStart(str, len, c) {
	len = len >> 0;

	if (str.length > len) return str;

	if (typeof c == "undefined") c = " ";

	len = len - str.length;
	if (len > c.length) {
		c += c.repeat(len / c.length);
	}

	return c.slice(0, len) + str;
}
