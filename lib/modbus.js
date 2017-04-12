exports.transports = {
	tcp    : require("./transport/tcp"),
	ascii  : require("./transport/ascii"),
	serial : require("./transport/serial")
};

exports.drivers = {
	serial : require("./driver/serial"),
	tcp    : require("./driver/tcp")
};

exports.stream = require("./stream");
exports.pdu    = require("modbus-pdu");

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

		if (typeof options.retry == "undefined") {
			options.retry = 30000;
		}

		var socket = exports.drivers.tcp.connect(port, host, options);

		socket.attach(exports.transports.tcp.prepare({ retry: options.retry }), next);
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

		if (typeof options.retry == "undefined") {
			options.retry = 30000;
		}

		return exports.drivers.tcp.server(options).attach(exports.transports.tcp.prepare({ retry: options.retry }), next);
	}
};

exports.serial = {
	connect : function (...args) {
		var possible_options = [ "retries", "retry", "beforewrite", "afterwrite" ];
		var device           = "/dev/ttyS0";
		var options          = {};
		var serial_options   = {};
		var next             = () => {};

		args.map((arg) => {
			switch (typeof arg) {
				case "string":
					device = arg;
					break;
				case "object":
					options = arg;
					break;
				case "function":
					next = arg;
					break;
			}
		});

		possible_options.map((option) => {
			if (typeof options[option] != "undefined") {
				serial_options[option] = options[option];
				delete options[option];
			}
		});

		var stream = exports.drivers.serial.connect(device, options);

		stream.attach(exports.transports.serial.prepare(serial_options), next);
	}
};
