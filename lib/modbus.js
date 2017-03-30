exports.transports = {
	tcp    : require("./transport/tcp"),
	ascii  : require("./transport/ascii"),
	serial : require("./transport/serial")
};

exports.drivers = {
	serial : require("./driver/serial"),
	tcp    : require("./driver/tcp")
};

exports.tcp = {
	connect : function (...args) {
		var port    = 502;
		var host    = "localhost";
		var options = {};
		var next    = () => {};

		args.map((arg) => {
			switch (typeof arg) {
				case "number":
					port = arg;
					break;
				case "string":
					host = arg;
					break;
				case "object":
					options = arg;
					break;
				case "function":
					next = arg;
					break;
			}
		});

		var socket = exports.drivers.tcp.connect(port, host, options);

		socket.attach(exports.transports.tcp.prepare(), next);
	},
	server : function (...args) {
		var options = {};
		var next    = () => {};

		args.map((arg) => {
			switch (typeof arg) {
				case "object":
					options = arg;
					break;
				case "function":
					next = arg;
					break;
			}
		});

		return exports.drivers.tcp.server(options).attach(exports.transports.tcp.prepare(), next);
	}
};
