exports.alloc = function (size) {
	if (typeof Buffer.alloc == "function") {
		return Buffer.alloc(size);
	}

	return new Buffer(size);
};

exports.from = function (data, encoding) {
	if (typeof Buffer.from == "function") {
		return Buffer.from(data, encoding);
	}

	return new Buffer(data, encoding);
};

exports.values = function (buf) {
	var v = [];

	for (var i = 0; i < buf.length; i++) {
		v.push(buf[i]);
	}

	return v;
};

exports.concat = function (list) {
	return Buffer.concat(list);
};

exports.indexOf = function (buf, val, offset) {
	if (typeof buf.indexOf === "function") {
		return buf.indexOf(val, offset);
	}

	for (var i = (offset || 0); i < buf.length - val.length + 1; i++) {
		if (buf[i] != val[0]) continue;

		for (var j = 1; j < val.length; j++) {
			if (buf[i + j] != val[j]) break;
		}

		if (j == val.length) return i;
	}

	return -1;
};
