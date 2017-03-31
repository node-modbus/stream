var fs        = require("fs");
var path      = require("path");
var Mocha     = require("mocha");
var mocha     = new Mocha();
var locations = [
	// modbus stream
	path.normalize(path.join(__dirname, "integration")),
	// modbus pdu
	path.normalize(path.join(__dirname, "..", "node_modules/modbus-pdu/test/integration")),
];

locations.map((location) => {
	fs.readdirSync(location).filter((file) => (file.substr(-3) == '.js')).map((file) => {
		mocha.addFile(path.join(location, file));
	});
});

mocha.run(process.exit);
