var dgram    = require("dgram");
var Readable = require("stream").Readable;
var util     = require("util");
var pdu      = require("modbus-pdu");
var stream   = require("../stream");

function Driver() {

}

Driver.connect = function (port, host, options) {
	if (typeof host == "object") {
		options = host;
		host    = "localhost";
	}

	port    = port || 502;
	host    = host || "localhost";
	options = options || {};

	return {
		attach : function (transport, next) {
			if (typeof options == "function") {
				next    = options;
				options = {};
			}

			var socket = dgram.createSocket("udp4");

			socket.write = function (data, next) {
				return socket.send(data, 0, data.length, port, host, next);
			};

			socket.on("message", function (msg, info) {
				socket.emit("data", msg);
			});

			setTimeout(function () {
				next(null, new stream(transport(socket, options), options));
			}, 0);

			return socket;
		}
	};
};

Driver.server = function (options) {
	options = options || {};

	return {
		attach : function (transport, next) {
			if (typeof options == "function") {
				next    = options;
				options = {};
			}

			var server = dgram.createSocket("udp4");

			server.on("message", function (msg, rinfo) {
				return next(new stream(transport(new UdpStream(msg, rinfo), options), options));
			});

			return server;
		}
	};
};

function UdpStream(msg, info) {
	Readable.call(this);

	this.msg  = msg;
	this.info = info;
}

util.inherits(UdpStream, Readable);

UdpStream.prototype._read = function (size) {
	this.push(this.msg.slice(0, size));

	this.msg = this.msg.slice(size);

	if (this.msg.length === 0) {
		this.push(null);
	}
};

UdpStream.prototype.write = function (data, next) {
	var socket = dgram.createSocket("udp4");

	socket.send(data, 0, data.length, this.info.port, this.info.address, next);
};

module.exports = Driver;
