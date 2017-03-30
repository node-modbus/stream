## Modbus Stream

This is a NodeJS v6 module to help you process modbus data. It uses [modbus-pdu](https://github.com/dresende/node-modbus-pdu) to build the core PDU and then uses transports to extend the rest.

### Roadmap

- [x] Support basic reading functions
- [x] Support basic writing functions (single and multiple)
- [x] Support exceptions
- [x] Support TCP transport
- [x] Support serial transport

### Example

This is my current `test.js` file. It creates a client and a server network socket and the server requests coils as soon as the client connects.

```js
var modbus = require("modbus-stream");

modbus.tcp.server({ debug: "server" }, (connection) => {
    connection.readCoils({ from: 3, to: 7 }, (err, info) => {
        console.log("response", info.response.data);
    });
}).listen(12345, () => {
    modbus.tcp.connect(12345, { debug: "client" }, (err, connection) => {
        connection.events.on("read-coils", (package, reply) => {
            reply(null, [ 1, 0, 1, 0, 1, 1, 0, 1 ]);
        });
    });
});
```
