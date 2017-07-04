var net    = require("net");
var pdu    = require("modbus-pdu");
var stream = require("../stream");

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

			var onError = function () {
				return next(pdu.Exception.error("GatewayPathUnavailable"));
			};

			var socket = net.connect(port, host, function () {
				socket.removeListener("error", onError);

				return next(null, new stream(transport(socket, options), options));
			});

			socket.on("error", onError);

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

			var server = net.createServer(function (socket) {
				return next(new stream(transport(socket), options));
			});

			return server;
		}
	};
};

module.exports = Driver;
