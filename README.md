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

## Usage

### Connection

To connect to a modbus device over TCP, use:

```js
var modbus = require("modbus-stream");

modbus.tcp.connect(502, "134.2.56.231", { debug: "automaton-2454" }, (err, connection) => {
    // do something with connection
});
```

To listen for connections over TCP, use:

```js
var modbus = require("modbus-stream");

modbus.tcp.server({ debug: "server" }, (connection) => {
    // do something with connection
}).listen(502, () => {
    // ready
});
```

To connecto to a modbus device over a serial port, use:

```js
var modbus = require("modbus-stream");

modbus.serial.connect("/dev/ttyS123", { debug: "automaton-123" }, (err, connection) => {
    // do something with connection
});
```

### Requests

After having a connection, you can send requests and listen for responses.

```js
modbus.serial.connect("/dev/ttyS123", { debug: "automaton-123" }, (err, connection) => {
    if (err) throw err;

    connection.readCoils({ address: 52, quantity: 8 }, (err, res) => {
        if (err) throw err;

        console.log(res); // response
    })
});
```

Every method accepts and object `options` which have defaults parameters (like `address = 0`) and a callback, in case you want to see the response from the remote device. Here is a list of supported function codes and the corresponding methods:

**Base Reads**

- `readCoils` (`address = 0`, `quantity = 1`)
- `readDiscreteInputs` (`address = 0`, `quantity = 1`)
- `readHoldingRegisters` (`address = 0`, `quantity = 1`)
- `readInputRegisters` (`address = 0`, `quantity = 1`)

**Base Writes**

- `writeSingleCoil` (`address = 0`, `value = 0`)
- `writeSingleRegister` (`address = 0`, `value = <Buffer 0x00 0x00>`)
- `writeMultipleCoils` (`address = 0`, `values = []`)
- `writeMultipleRegisters` (`address = 0`, `values = [ <Buffer 0x00 0x00> ]`)

**File Records**

- `readFileRecord` (`requests = []`)
- `writeFileRecord` (`requests = []`)

**FIFO**

- `readFifoQueue` (`address = 0`)

**Advanced**

- `maskWriteRegister` (`address = 0`, `andmask = 0xFFFF`, `ormask = 0x0000`)

### Responses

To respond to remote requests, listen for events.

```js
modbus.serial.connect("/dev/ttyS123", {
    // except "debug", everything else is the default for serial
    baudRate : 9600,
    dataBits : 8,
    stopBits : 1,
    parity   : "none",
    debug    : "automaton-123"
}, (err, connection) => {
    if (err) throw err;

    connection.events.on("read-coils", (req, reply) => {
        console.log(req); // request

        // ...
        return reply(null, [ data ]);
    })
});
```
