const serialport = require("serialport");
const stream     = require("../stream");

class Driver {
	static connect (device = "/dev/ttyS0", options = {}) {
		var port = new serialport(device, {
			baudRate : options.baudRate || 9600,
			dataBits : options.dataBits || 8,
			stopBits : options.stopBits || 1,
			parity   : options.parity   || "none",
			autoOpen : false
		});

		return {
			attach : (transport, next) => {
				if (typeof options == "function") {
					next    = options;
					options = {};
				}

				port.open((err) => {
					if (err) return next(err);

					return next(null, new stream(transport(port), options));
				});

				return port;
			}
		}
	}
}

module.exports = Driver;
