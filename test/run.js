var fs       = require("fs");
var path     = require("path");
var Mocha    = require("mocha");
var mocha    = new Mocha();
var location = path.normalize(path.join(__dirname, "integration"));

fs.readdirSync(location).filter(function (file) {
	return (file.substr(-3) == '.js');
}).forEach(function (file) {
	mocha.addFile(path.join(location, file));
});

mocha.run(function (failures) {
	process.exit(failures);
});
