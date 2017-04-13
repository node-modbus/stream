var assert = require("assert");
var help   = require("../help");

describe("transport tcp", function () {
	var transport = new help.modbus.transports.tcp(help.stream());

	help.tests().map(function (test) {
		var package = Buffer.concat([
			help.tcp_header(test.pdu, test.transactionId, test.protocol, test.unitId),
			test.pdu
		]);
		var data = transport.unwrap(package);

		describe(test.name + " " + help.print_buffer(package), function () {
			if (test.pass === false) {
				it("not valid", function () {
					assert(data === false);
				});
			} else {
				it("valid", function () {
					assert(data !== false);
				});

				it("transactionId = " + test.transactionId, function () {
					assert(data.transactionId === test.transactionId);
				});

				it("protocol = " + test.protocol, function () {
					assert(data.protocol === test.protocol);
				});

				it("unitId = " + test.unitId, function () {
					assert(data.unitId === test.unitId);
				});

				it("pdu = " + help.print_buffer(test.pdu), function () {
					assert(data.pdu.length === test.pdu.length);

					help.buffer.values(data.pdu).map(function (_, i) {
						assert(data.pdu[i] === test.pdu[i]);
					});
				});
			}
		});
	});
});
