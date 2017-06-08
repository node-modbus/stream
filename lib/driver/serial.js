var serialport = (require("serialport/package").version.split(".")[0] > 3 ? require("serialport") : require("serialport").SerialPort);
var stream     = require("../stream");
var pdu        = require("modbus-pdu");

function Driver() {

}

Driver.connect = function (device, options) {
	options = options || {};

	var port = new serialport(device || "/dev/ttyS0", {
		baudRate : options.baudRate || 9600,
		dataBits : options.dataBits || 8,
		stopBits : options.stopBits || 1,
		parity   : options.parity   || "none",
		autoOpen : false
	});

	return {
		attach : function (transport, next) {
			if (typeof options == "function") {
				next    = options;
				options = {};
			}

			port.on("error", function () {});

			port.open(function (err) {
				if (err) return next(pdu.Exception.error("GatewayPathUnavailable"));

				return next(null, new stream(transport(port), options));
			});

			return port;
		}
	}
};

module.exports = Driver;
