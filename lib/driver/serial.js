var serialport = require("serialport");
var stream     = require("../stream");

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

			port.open(function (err) {
				if (err) return next(err);

				return next(null, new stream(transport(port), options));
			});

			return port;
		}
	}
};

module.exports = Driver;
