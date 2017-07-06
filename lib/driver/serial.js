var serialport = (require("serialport/package").version.split(".")[0] > 3 ? require("serialport") : require("serialport").SerialPort);
var stream     = require("../stream");
var pdu        = require("modbus-pdu");

function Driver() {

}

Driver.connect = function (device, options) {
	options = options || {};

	options.autoOpen = false;
	options.baudRate = options.baudRate || 9600;
	options.dataBits = options.dataBits || 8;
	options.stopBits = options.stopBits || 1;
	options.parity   = options.parity || "none";

	var port = new serialport(device || "/dev/ttyS0", options);

	return {
		attach : function (transport, next) {
			port.on("error", function () {});

			port.open(function (err) {
				if (err) return next(pdu.Exception.error("GatewayPathUnavailable"));

				return next(null, new stream(transport(port, options), options));
			});

			return port;
		}
	}
};

module.exports = Driver;
