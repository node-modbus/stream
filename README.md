## Modbus Stream

This is a NodeJS v6 module to help you process modbus data. It uses [modbus-pdu](https://github.com/dresende/node-modbus-pdu) to build the core PDU and then uses transports to extend the rest.

### Roadmap

- [x] Support basic reading function codes
- [ ] Support basic writing function codes
- [x] Support TCP transport
- [ ] Support serial transport

Writing functions should be fairly simple as they're already supported by the PDU module. The serial transport will rely on `serialport` but I haven't got the time needed.

### Example

This is my current `test.js` file. It creates a client and a server network socket and the server requests coils as soon as the client connects.

```js
var net    = require("net");
var modbus = require("modbus-stream");

var server = net.createServer((socket) => {
    var stream = new modbus.Stream(new modbus.TCP(), socket, { debug: "server" });

    stream.readCoils({ from: 3, to: 7 }, (err, info) => {
        console.log("response", info.response.data);
    });
});

server.listen(12345, () => {

    var socket = net.connect(12345, () => {
        var stream = new modbus.Stream(new modbus.TCP(), socket, { debug: "client" });

        stream.events.on("read-coils", (package, reply) => {
            reply(null, [ 1, 0, 1, 0, 1, 1, 0, 1 ]);
        });
    });
});
```
