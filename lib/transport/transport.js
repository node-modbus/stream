const pdu          = require("modbus-pdu");
const EventEmitter = require("events");

class BaseTransport extends EventEmitter {
	constructor (stream, options = {}) {
		super();

		this.stream      = stream;
		this.retries     = (options.retries > 0 ? options.retries : 0);
		this.retry       = (options.retry > 0 ? options.retry : 500);
		this.beforewrite = (typeof options.beforewrite == "function" ? options.beforewrite : null);
		this.afterwrite  = (typeof options.afterwrite == "function" ? options.afterwrite : null);
		this.retryTimer  = null;
		this.listen();
	}
	write (data, next) {
		this.emit("outgoing-data", data);

		if (typeof this.stream.drain == "function") {
			this.stream.write(data);

			if (typeof next == "function") {
				this.stream.drain(next);
			}
		} else {
			this.stream.write(data, next);
		}
	}
	send (fcode, extra, next, ...args) {
		this.retrySend(this.wrap(pdu[fcode].Request.build(...args), extra, next), this.retries, this.retry);
	}
	retrySend (data, retries, retry) {
		call_queue(this.beforewrite, () => {
			this.write(data, () => {
				call_queue(this.afterwrite, () => {
					if (retries > 0) {
						this.retryTimer = setTimeout(() => {
							this.retrySend(data, retries - 1, retry);
						}, retry);
					}
				});
			});
		});
	}
	listen () {
		this.stream.on("data", (data) => {
			if (this.retryTimer) {
				clearTimeout(this.retryTimer);
				this.retryTimer = null;
			}
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

					if (typeof req.request.code == "number") {
						// unknown function code
						this.emit("request", req.request.code, req, (err, ...data) => {
							if (err instanceof Error) {
								return this.write(this.wrap(pdu.Exception.build(req.request.code, err.code || +err.message), req));
							} else if (typeof err == "string" && err.length > 0) {
								return this.write(this.wrap(pdu.Exception.build(req.request.code, pdu.Exception[err]), req));
							}

							this.write(this.wrap(data, req));
						});
					} else {
						let event_name = req.request.code.replace(/(.)([A-Z])/g, (m, b, l) => (b + "-" + l)).toLowerCase();

						this.emit("request", event_name, req, (err, ...data) => {
							if (err instanceof Error) {
								return this.write(this.wrap(pdu[req.request.code].Exception.build(err.code || +err.message), req));
							} else if (typeof err == "string" && err.length > 0) {
								return this.write(this.wrap(pdu[req.request.code].Exception.build(pdu.Exception[err]), req));
							}

							this.write(this.wrap(pdu[req.request.code].Response.build(...data), req));
						});
					}
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

function call_queue(fn, next) {
	if (typeof fn != "function") return next();

	return fn(next);
}
