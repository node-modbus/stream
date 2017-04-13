var pdu          = require("modbus-pdu");
var util         = require("util");
var EventEmitter = require("events").EventEmitter;

function BaseTransport(stream, options) {
	EventEmitter.call(this);

	options = options || {};

	this.stream      = stream;
	this.retries     = (options.retries > 0 ? options.retries : 0);
	this.retry       = (options.retry > 0 ? options.retry : 500);
	this.beforewrite = (typeof options.beforewrite == "function" ? options.beforewrite : null);
	this.afterwrite  = (typeof options.afterwrite == "function" ? options.afterwrite : null);
	this.retryTimer  = null;
	this.listen();
}
util.inherits(BaseTransport, EventEmitter);

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
	var args = Array.prototype.slice.apply(arguments, 3);

	this.retrySend(this.wrap(pdu[fcode].Request.build.apply(pdu[fcode].Request, args), extra, next), this.retries, this.retry, next);
};

BaseTransport.prototype.retrySend = function (data, retries, retry, next) {
	var transport = this;

	call_queue(this.beforewrite, function () {
		transport.write(data, function () {
			call_queue(transport.afterwrite, function () {
				if (retries > 0) {
					transport.retryTimer = setTimeout(function () {
						transport.retrySend(data, retries - 1, retry, next);
					}, retry);
				} else {
					transport.retryTimer = setTimeout(function () {
						return next(new Error("GatewayTargetDeviceFailedToRespond"));
					}, retry);
				}
			});
		});
	});
};
BaseTransport.prototype.listen = function () {
	var transport = this;

	this.stream.on("data", function (data) {
		if (transport.retryTimer) {
			clearTimeout(transport.retryTimer);
			transport.retryTimer = null;
		}
		transport.emit("incoming-data", data);

		var req = transport.unwrap(data);

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

						transport.write(transport.wrap(data, req));
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
	});
};

BaseTransport.prepare = function (options) {
	return function (stream) {
		return new this(stream, options);
	};
};

module.exports = BaseTransport;

function call_queue(fn, next) {
	if (typeof fn != "function") return next();

	return fn(next);
}
