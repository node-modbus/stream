const pdu          = require("modbus-pdu");
const EventEmitter = require("events");

class BaseTransport extends EventEmitter {
	constructor (stream, options = {}) {
		super();

		this.stream   = stream;
		this.listen();
	}
	write (data) {
		this.emit("outgoing-data", data);
		this.stream.write(data);
	}
	send (fcode, extra, next, ...args) {
		this.write(this.wrap(pdu[fcode].Request.build(...args), extra, next));
	}
	listen () {
		this.stream.on("data", (data) => {
			this.emit("incoming-data", data);

			let req = this.unwrap(data);

			// not complete
			if (req === false) return;

			if (typeof req.callback == "function") {
				try {
					req.response = pdu.Response(req.pdu);

					if (typeof req.response.exception != "undefined") {
						req.callback(new Error(req.response.exception), req);
					} else {
						req.callback(null, req);
					}

					delete req.callback;
				} catch (err) {
					this.emit("error", err);
				}
			} else {
				try {
					req.request = pdu.Request(req.pdu);

					let event_name = req.request.code.replace(/(.)([A-Z])/g, (m, b, l) => (b + "-" + l)).toLowerCase();

					this.emit("request", event_name, req, (err, ...data) => {
						if (err instanceof Error) {
							return this.write(this.wrap(pdu[req.request.code].Exception.build(err.code || +err.message)));
						}

						this.write(this.wrap(pdu[req.request.code].Response.build(...data), req));
					});
				} catch (err) {
					this.emit("error", err);
				}
			}
		});
	}
	static prepare (options) {
		return (stream) => {
			return new this(stream, options);
		};
	}
}

module.exports = BaseTransport;
