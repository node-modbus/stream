var util          = require("util");
var BaseTransport = require("./transport");

function Transport(stream, options) {
	options = options || {};

	BaseTransport.call(this, stream, options);

	var transactionId = (typeof options.transactionId != "undefined" ? options.transactionId : 1);
	var protocol      = (typeof options.protocol != "undefined" ? options.protocol : 0);

	this.transactionId = transactionId - 1;
	this.protocol      = protocol;
	this.callbacks     = {};
	this.buffer        = null;
}
util.inherits(Transport, BaseTransport);

Transport.prototype.wrap = function (pdu, options, next) {
	options = options || {};
	next    = next || null;

	var unitId        = (typeof options.unitId != "undefined" ? options.unitId : 1);
	var transactionId = (typeof options.transactionId != "undefined" ? options.transactionId : null);
	var buffer        = Buffer.alloc(pdu.length + 7);

	if (transactionId !== null) {
		buffer.writeUInt16BE(transactionId, 0);
	} else {
		this.transactionId += 1;

		buffer.writeUInt16BE(this.transactionId, 0);
	}

	if (typeof next == "function") {
		this.callbacks["" + buffer.readUInt16BE(0)] = next;
	}

	buffer.writeUInt16BE(this.protocol, 2);
	buffer.writeUInt16BE(pdu.length + 1, 4);
	buffer.writeUInt8(unitId, 6);

	pdu.copy(buffer, 7);

	return buffer;
};

Transport.prototype.unwrap = function (data) {
	this.buffer = (this.buffer === null ? data : Buffer.concat([ this.buffer, data ]));

	// not enough data to see package length
	if (this.buffer.length < 6) return false;

	var length = this.buffer.readUInt16BE(4);

	if (this.buffer.length - length - 6) return false;

	var unwrapped = {
		transactionId : this.buffer.readUInt16BE(0),
		protocol      : this.buffer.readUInt16BE(2),
		length        : length,
		unitId        : this.buffer.readUInt8(6),
		pdu           : this.buffer.slice(7, length + 6)
	};

	if (typeof this.callbacks["" + unwrapped.transactionId] == "function") {
		unwrapped.callback = this.callbacks["" + unwrapped.transactionId];
	}

	this.buffer = (this.buffer.length > length + 6 ? this.buffer.slice(length + 6) : null);

	return unwrapped;
};

module.exports = Transport;
