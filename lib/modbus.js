exports.transports = {
	tcp    : require("./transport/tcp"),
	ascii  : require("./transport/ascii"),
	serial : require("./transport/serial")
};

exports.drivers = {
	serial : require("./driver/serial"),
	tcp    : require("./driver/tcp")
};
