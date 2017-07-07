var assert = require("assert");
var help   = require("../help");

describe("transport tcp", function () {
	var transport = new help.modbus.transports.tcp(help.stream());

	help.tests().map(function (test) {
		var request = Buffer.concat([
			help.tcp_header(test.pdu, test.transactionId, test.protocol, test.unitId),
			test.pdu
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

	it("should receive options from constructor helper", function (done) {
		var port  = 65123;
		var proto = 123;

		help.modbus.tcp.server({ protocol: proto }, function (stream) {
			assert(stream.transport.protocol === proto);

			return done();
		}).listen(port, function () {
			help.modbus.tcp.connect(port, function (err, socket) {
				socket.close();
			});
		});
	});
});
