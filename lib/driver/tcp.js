const net    = require("net");
const stream = require("../stream");

class Driver {
	static connect (port = 502, host = "localhost", options = {}) {
		if (typeof host == "object") {
			options = host;
			host    = "localhost";
		}

		return {
			attach : (transport, next) => {
				if (typeof options == "function") {
					next    = options;
					options = {};
				}

				var socket = net.connect(port, host, () => {
					return next(null, new stream(transport(socket), options));
				});

				return socket;
			}
		};
	}
	static server (options = {}) {
		return {
			attach : (transport, next) => {
				if (typeof options == "function") {
					next    = options;
					options = {};
				}

				var server = net.createServer((socket) => {
					return next(new stream(transport(socket), options));
				});

				return server;
			}
		};
	}
}

module.exports = Driver;
