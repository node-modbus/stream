var stream = require("../stream");
var pdu    = require("modbus-pdu");

function Driver() {

}

Driver.connect = function (device, options) {
	options = options || {};

	options.autoOpen = false;
	options.baudRate = options.baudRate || 9600;
	options.dataBits = options.dataBits || 8;
	options.stopBits = options.stopBits || 1;
	options.parity   = options.parity || "none";
	options.path  	 = device || "/dev/ttyS0";

	var serialport = require("serialport").SerialPort;
	var port = new serialport(options);

	return {
		attach : function (transport, next) {
			port.on("error", function () {});

			console.log('serial port is:', port);
			port.open(function (err) {
				if (err) return next(pdu.Exception.error("GatewayPathUnavailable"));

				return next(null, new stream(transport(port, options), options));
			});

			return port;
		}
	}
};

module.exports = Driver;
