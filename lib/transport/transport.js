var pdu          = require("modbus-pdu");
var util         = require("util");
var buffer       = require("../buffer");
var EventEmitter = require("events").EventEmitter;

function BaseTransport(stream, options) {
	EventEmitter.call(this);

	options = options || {};

	this.stream        = stream;
	this.retries       = (options.retries > 0 ? options.retries : 0);
	this.retry         = (options.retry > 0 ? options.retry : 500);
	this.beforerequest = (typeof options.beforerequest == "function" ? options.beforerequest : null);
	this.afterrequest  = (typeof options.afterrequest == "function" ? options.afterrequest : null);
	this.mutex         = (typeof options.mutex != "undefined" ? options.mutex : false);
	this.retryTimer    = {};
	this.closed        = false;

	this.stream.on("error", function (err) {
		this.emit("error", err);
	}.bind(this));

	setTimeout(function () {
		this.listen();
	}.bind(this), 0);
}
util.inherits(BaseTransport, EventEmitter);

BaseTransport.prototype.close = function (next) {
	this.closed = true;

	this.stream.close(next);
};

BaseTransport.prototype.write = function (data, next) {
	this.emit("outgoing-data", data);

	if (typeof this.stream.drain == "function") {
		this.stream.write(data);

		if (typeof next == "function") {
			this.stream.drain(next);
		}
	} else {
		this.stream.write(data, next);
	}
};

BaseTransport.prototype.send = function (fcode, extra, next) {
	if (this.closed) {
		var err = new Error("Transport stream has already been closed");
		err.code = "ECLOSED";

		return next(err);
	}

	var data = Array.prototype.slice.call(arguments, 3);

	if (this.mutex) {
		var transport = this;

		this.mutex.lock(function (unlock) {
			var done = function () {
				unlock();
				next.apply(null, arguments);
			};

			transport.retrySend(transport.wrap(pdu[fcode].Request.build.apply(pdu[fcode].Request, data), extra, done), transport.retries, transport.retry, done);
		})
	} else {
		this.retrySend(this.wrap(pdu[fcode].Request.build.apply(pdu[fcode].Request, data), extra, next), this.retries, this.retry, next);
	}
};

BaseTransport.prototype.retrySend = function (data, retries, retry, next) {
	var transport = this;

	call_queue(this.beforerequest, function () {
		transport.write(data, function () {
			call_queue(transport.afterrequest, function () {
				var k = data.__callback_key || "-";

				if (retries > 0) {
					transport.retryTimer[k] = setTimeout(function () {
						transport.clearSend();
						transport.retrySend(data, retries - 1, retry, next);
					}, retry);
				} else {
					transport.retryTimer[k] = setTimeout(function () {
						delete transport.retryTimer[k];

						return next(pdu.Exception.error("GatewayTargetDeviceFailedToRespond"));
					}, retry);
				}
			});
		});
	});
};

BaseTransport.prototype.clearSend = function () {
	// Transports should rewrite this method
	// if they need to reset anything before
	// retrying
};

BaseTransport.prototype.listen = function () {
	var transport = this;
	var handle    = function (data) {
		var req = transport.unwrap(data);

		// not complete
		if (req === false) return;

		var k = req.__callback_key || "-";

		if (typeof transport.retryTimer[k] != "undefined") {
			clearTimeout(transport.retryTimer[k]);
			delete transport.retryTimer[k];
		}

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
				transport.emit("error", err);
			}
		} else {
			try {
				req.request = pdu.Request(req.pdu);

				if (typeof req.request.code == "number") {
					// unknown function code
					transport.emit("request", req.request.code, req, function (err) {
						var data = Array.prototype.slice.call(arguments, 1);

						if (err instanceof Error) {
							return transport.write(transport.wrap(pdu.Exception.build(req.request.code, err.code || +err.message), req));
						} else if (typeof err == "string" && err.length > 0) {
							return transport.write(transport.wrap(pdu.Exception.build(req.request.code, pdu.Exception[err]), req));
						}

						transport.write(transport.wrap(buffer.concat([ buffer.from([ req.request.code ]) ].concat(data)), req));
					});
				} else {
					var event_name = req.request.code.replace(/(.)([A-Z])/g, function (m, b, l) { return b + "-" + l}).toLowerCase();

					transport.emit("request", event_name, req, function (err) {
						var data = Array.prototype.slice.call(arguments, 1);

						if (err instanceof Error) {
							return transport.write(transport.wrap(pdu[req.request.code].Exception.build(err.code || +err.message), req));
						} else if (typeof err == "string" && err.length > 0) {
							return transport.write(transport.wrap(pdu[req.request.code].Exception.build(pdu.Exception[err]), req));
						}

						transport.write(transport.wrap(pdu[req.request.code].Response.build.apply(pdu[req.request.code].Response, data), req));
					});
				}
			} catch (err) {
				transport.emit("error", err);
			}
		}

		// transport should expose this method if it can
		// handle data bursts with multiple packages
		if (typeof transport.pending == "function" && transport.pending()) {
			handle(buffer.alloc(0));
		}
	};

	this.stream.on("data", function (data) {
		transport.emit("incoming-data", data);

		handle(data);
	});
};

module.exports = BaseTransport;

function call_queue(fn, next) {
	if (typeof fn != "function") return next();

	return fn(next);
}
