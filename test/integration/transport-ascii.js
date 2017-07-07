var assert = require("assert");
var buffer = require("../../lib/buffer");
var help   = require("../help");

describe("transport ascii", function () {
	var transport = new help.modbus.transports.ascii(help.stream());

	help.tests().map(function (test) {
		var request = help.ascii_wrap(test.slaveId, test.pdu);
		var data    = transport.unwrap(request);

		describe(test.name + " " + help.print_buffer(request), function () {
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

					help.buffer.values(data.pdu).map(function (_, i) {
						assert(data.pdu[i] === test.pdu[i]);
					});
				});

				it("crc = " + help.print_buffer(buffer.from([ data.crc ])), function () {
					assert(data.crc === data.expected_crc);
				});
			}
		});
	});
});
