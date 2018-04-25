var util          = require("util");
var buffer        = require("../buffer");
var BaseTransport = require("./transport");
const crc16 = require("node-crc16");

function Transport(stream, options) {
	options = options || {};

	BaseTransport.call(this, stream, options);

	var transport     = this;

	this.transactionId = (typeof options.transactionId != "undefined" ? options.transactionId : 1) - 1;
	this.unitId        = (typeof options.unitId != "undefined" ? options.unitId : 1);
	this.protocol      = (typeof options.protocol != "undefined" ? options.protocol : 0);
	this.callbacks     = {};
	this.buffer        = null;

	this.stream.on("end", function () {
		transport.emit("close");
	});
}
util.inherits(Transport, BaseTransport);

Transport.prototype.wrap = function (pdu, options, next) {
  // console.log('PINGWIN pdu', pdu)
  // if (pdu.readInt8(0) === 43) {
  //   const dataCrc = crc16.checkSum(pdu, {retType: 'int'});
  //   var dataBuffer = buffer.alloc(pdu.length + 2);
  //   pdu.copy(dataBuffer, 0);
  //   dataBuffer.writeUInt16BE(dataCrc, 4);
  //   console.log('PINGWIN dataBuffer', dataBuffer)
  // 	return dataBuffer;
  // };

	options = options || {};
	next    = next || null;

	var unitId        = (typeof options.unitId != "undefined" ? options.unitId : this.unitId);

	var dataBuffer = buffer.alloc(pdu.length + 1);
  dataBuffer.writeUInt8(unitId, 0);
  pdu.copy(dataBuffer, 1)

	const dataCrc = crc16.checkSum(dataBuffer, {retType: 'int'});

  const data = buffer.alloc(dataBuffer.length + 2);
  data.writeUInt16BE(dataCrc, 6);
  dataBuffer.copy(data, 0)

	if (typeof next == "function") {
		var key = [ unitId, pdu.readUInt8(0) ].join(":");

		this.callbacks[key] = next;

		data.__callback_key = key;
	}

	return data;
};

Transport.prototype.close = function (next) {
	this.closed = true;

	this.stream.end(next);
};

Transport.prototype.pending = function () {
	return (this.buffer !== null && this.buffer.length);
};

Transport.prototype.unwrap = function (data) {
	this.buffer = data;

	// not enough data to see package length
	if (this.buffer.length < 5) return false;

	var length = this.buffer.length;


	var unwrapped = {
		length        : length,
		unitId        : this.buffer.readUInt8(0),
		pdu           : this.buffer.slice(1, length - 2),
		stream        : this.stream
	};
	unwrapped.__callback_key = [ unwrapped.unitId, unwrapped.pdu.readUInt8(0) ].join(":");

	if (typeof this.callbacks[unwrapped.__callback_key] == "function") {
		unwrapped.callback = this.callbacks[unwrapped.__callback_key];
		delete this.callbacks[unwrapped.__callback_key];
	}

	return unwrapped;
};

Transport.prepare = function (options) {
	return function (stream) {
		return new Transport(stream, options);
	};
};

module.exports = Transport;
