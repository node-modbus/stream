## Modbus Stream

[![Build Status](https://secure.travis-ci.org/node-modbus/stream.png?branch=master)](http://travis-ci.org/node-modbus/stream)
[![Package Version](https://badge.fury.io/js/modbus-stream.svg)](https://npmjs.org/package/modbus-stream)
[![Dependency Status](https://gemnasium.com/badges/github.com/node-modbus/stream.svg)](https://gemnasium.com/github.com/node-modbus/stream)


This is a NodeJS module to help you process modbus data. It uses [pdu](https://github.com/node-modbus/pdu) to build the core PDU and then uses transports to extend the rest.

### Features

- [x] Support almost every standard function code
- [x] Support standard exceptions
- [x] Support transports
    - [x] TCP
    - [x] RTU
    - [x] ASCII
- [x] Support drivers
    - [x] TCP
    - [x] UDP
    - [x] Serial (RS232, RS485)

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
        connection.on("read-coils", (request, reply) => {
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
- `readWriteMultipleRegisters` (`read_address = 0`, `read_quantity = 1`, `write_address = 0`, `values = [ <Buffer 0x00 0x00> ]`)
- `readDeviceIdentification` (`type = "BasicDeviceIdentification"`, `id = "ProductName"`)
- `readExceptionStatus` ()
- `getCommEventCounter` ()
- `getCommEventLog` ()

For more information on these methods, look at the [pdu repository](https://github.com/node-modbus/pdu) which is used
to build the packets.

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

### Events

There are events propagated from the transports up to the stream. You should bind some event listener
just in case the connection or serial device errors or just closes. Remember that in NodeJS, an emitted
error event without a listener will cause the process to throw an `uncaughtException`.

#### Transport Closed (`close`)

This event is emitted when the `serialport` module emits a `close` event or when a socket emits an
`end` event.

#### Transport Error (`error`)

This event if something happens to the underlying stream, like a `ECONNRESET` or something similar.
