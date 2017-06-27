var assert = require("assert");
var help   = require("../help");

describe("transport quirks", function () {
	[ "serial", "tcp", "ascii" ].map(function (TRANSPORT) {
		describe(TRANSPORT, function () {
			var transport = new help.modbus.transports[TRANSPORT](help.stream(), {
				retries : 0,
				retry   : 5000
			});
			var stream    = new help.modbus.stream(transport, {
				debug : TRANSPORT
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
		});
	});
});
