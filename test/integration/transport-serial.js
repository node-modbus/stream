var assert = require("assert");
var help   = require("../help");

describe("transport serial", function () {
	var transport = new help.modbus.transports.serial(help.stream());

	help.tests().map(function (test) {
		var request = Buffer.concat([
			help.serial_header(test.slaveId),
			test.pdu,
			test.crc
		]);
		var data = transport.unwrap(request);

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

				it("crc = " + help.print_buffer(test.crc), function () {
					assert(data.crc === data.expected_crc);
				});
			}
		});
	});
});
