import * as modbus from "modbus-stream";

// $ExpectType void
modbus.tcp.connect(502, "134.2.56.231", { debug: "automaton-2454" }, (
    err, // $ExpectType Error | null
    connection // $ExpectType TCPStream
) => {
    // ...
});

modbus.tcp.server({ debug: "server" }, (
    connection // $ExpectType TCPStream
) => {
    // ...
}).listen(502, () => {
    // ready
});

// $ExpectType void
modbus.udp.connect(502, "134.2.56.231", { debug: "automaton-2454" }, (
    err, // $ExpectType Error | null
    connection // $ExpectType TCPStream
) => {
    // ...
});

modbus.udp.server({ debug: "server" }, (
    connection // $ExpectType TCPStream
) => {
    // ...
}).listen(502, () => {
    // ready
});

// $ExpectType void
modbus.serial.connect("/dev/ttyS123", { debug: "automaton-123" }, (
    err, // $ExpectType Error | null
    connection // $ExpectType Stream
) => {
    // ...
});

// $ExpectType void
modbus.serial.connect("/dev/ttyS123", { debug: "automaton-123" }, (
    err,  // $ExpectType Error | null
    connection // $ExpectType Stream
) => {
    if (err) throw err;

    connection.readCoils({ address: 52, quantity: 8 }, (
        err, // $ExpectType Error | null
        res
    ) => {
        if (err) throw err;

        console.log(res); // response
    });
});

// $ExpectType void
modbus.serial.connect("/dev/ttyS123", {
    // except "debug", everything else is the default for serial
    baudRate : 9600,
    dataBits : 8,
    stopBits : 1,
    parity   : "none",
    debug    : "automaton-123"
}, (
    err, // $ExpectType Error | null
    connection // $ExpectType Stream
) => {
    if (err) throw err;

    connection.on("read-coils", (
        req, // $ExpectType UnwrappedData
        reply
    ) => {
        reply(null, [ 0, 1, 2 ]);
    });
});

// $ExpectType void
modbus.serial.connect("/dev/ttyS123", { mode: "ascii" }, (
    err, // $ExpectType Error | null
    connection // $ExpectType Stream
) => {
    // ...
});
