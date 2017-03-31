var assert = require("assert");
var help   = require("../help");

describe("transport ascii", function () {
	var transport = new help.modbus.transports.ascii(help.stream());

	help.tests().map((test) => {
		var package = help.ascii_wrap(test.slaveId, test.pdu);
		var data    = transport.unwrap(package);

		describe(test.name + " " + help.print_buffer(package), function () {
			if (test.pass === false) {
				it("not valid", function () {
					assert(data === false);
				});
			} else {
				it("valid", function () {
					assert(data !== false);
				});

				it("slaveId = " + test.slaveId, function () {
					assert(data.slaveId === test.slaveId);
				});

				it("pdu = " + help.print_buffer(test.pdu), function () {
					assert(data.pdu.length === test.pdu.length);

					data.pdu.map((_, i) => {
						assert(data.pdu[i] === test.pdu[i]);
					});
				});

				it("crc = " + help.print_buffer(Buffer.from([ data.crc ])), function () {
					assert(data.crc === data.expected_crc);
				});
			}
		});
	});
});
