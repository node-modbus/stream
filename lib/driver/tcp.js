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

			var onTimeout = function () {
				// destroy here instead of end, otherwise we end up still getting the system's ETIMEDOUT onError
				socket.destroy();
				return next(pdu.Exception.error("GatewayPathUnavailable"));
			};

			var socket = net.connect(port, host, function () {
				socket.removeListener("error", onError);
				// remove this listener, otherwise it will also act as an inactivity timeout, not just connecting timeout.
				socket.removeListener("timeout", onTimeout);

				return next(null, new stream(transport(socket, options), options));
			});

			if (typeof options.connectTimeout == "undefined") {
				options.connectTimeout = 10000; // 10 secs
			}
			if (options.connectTimeout > 0) {
				socket.setTimeout(options.connectTimeout);
			}

			socket.on("error", onError);
			socket.on("timeout", onTimeout);

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
