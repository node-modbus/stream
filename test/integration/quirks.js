var assert = require("assert");
var help   = require("../help");
var debug  = true;

describe("transport quirks", function () {
	[ "serial", "ascii", "tcp" ].map(function (TRANSPORT) {
		describe(TRANSPORT, function () {
			var transport = new help.modbus.transports[TRANSPORT](help.stream(), {
				retries : 0,
				retry   : 5000
			});
			var stream    = new help.modbus.stream(transport, {
				debug : (debug ? TRANSPORT : null)
			});

			it("should invoke callback only once", function (done) {
				this.timeout(5000);

				var responses = 0;
				var timer     = setTimeout(function () {
					assert.equal(responses, 1, "Transport should invoke callback once");

					return done();
				}, 3000);

				stream.readCoils({ address: 0, quantity: 1, extra: { transactionId: 10 } }, function (err) {
					if (err) {
						// timeout receiving response
						clearTimeout(timer);

						return done(err);
					}

					responses += 1;
				});

				var res = stream.transport.wrap(help.modbus.pdu.ReadCoils.Response.build([ 1 ]), { transactionId: 10 });

				stream.transport.stream.push(res);

				setTimeout(function () {
					stream.transport.stream.push(res);
				}, 1000);

				setTimeout(function () {
					stream.transport.stream.push(res);
				}, 2000);
			});

			if (TRANSPORT != "tcp") return;

			it("should properly split data", function (done) {
				this.timeout(5000);

				var responses = 0;
				var timer     = setTimeout(function () {
					assert.equal(responses, 1, "Transport should properly split data");

					return done();
				}, 2000);

				stream.readCoils({ address: 0, quantity: 1, extra: { transactionId: 10 } }, function (err) {
					if (err) {
						// timeout receiving response
						clearTimeout(timer);

						return done(err);
					}

					responses += 1;
				});

				var res = stream.transport.wrap(help.modbus.pdu.ReadCoils.Response.build([ 1 ]), { transactionId: 10 });

				res = help.buffer.concat([ res, res, res ]);

				stream.transport.stream.push(res);
			});
		});
	});

	describe("serial", function () {
		var transport = new help.modbus.transports.serial(help.stream(), {
			retries : 0,
			retry   : 5000
		});
		var stream    = new help.modbus.stream(transport, {
			debug : (debug ? "serial" : null)
		});

		it("should be able to merge several pieces of a package", function (done) {
			var res = stream.transport.wrap(help.modbus.pdu.ReadCoils.Request.build(2, 4), { slaveId: 10 });

			stream.on("read-coils", function (req, reply) {
				assert.equal(req.slaveId, 10);
				assert.equal(req.request.address, 2);
				assert.equal(req.request.quantity, 4);

				return done();
			});

			stream.transport.stream.push(res.slice(0, 2));
			stream.transport.stream.push(res.slice(2, 4));
			stream.transport.stream.push(res.slice(4));
		});
	});
});
