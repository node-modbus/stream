var assert = require("assert");
var help   = require("../help");

describe("transport passing a mutex", function () {
	it("should lock/unlock before/after requests", function (done) {
		var completed = 0;
		var mutex     = new Mutex(function () {
			completed += 1;
		});
		var transport = new help.modbus.transports.serial(help.stream(), { mutex: mutex });
		var next      = function () {
			if (completed === 3) return done();
		};

		// default timeout for serial is 0.5s so these 3 requests
		// should finish before the mocha default 2.0s timeout
		transport.send("ReadDiscreteInputs", {}, next, 0x00, 0x01);
		transport.send("ReadDiscreteInputs", {}, next, 0x00, 0x01);
		transport.send("ReadDiscreteInputs", {}, next, 0x00, 0x01);
	});

	function Mutex(completed) {
		var locked = false;
		var queue  = [];
		var check  = function () {
			if (locked) return;
			if (!queue.length) return;

			var item = queue.shift();

			locked = true;

			item(function () {
				locked = false;
				completed();
				check();
			});
		};

		return {
			lock : function (next) {
				queue.push(next);
				check();
			}
		}
	}
});
