module.exports = [{
	name          : "read coil status",
	pdu           : Buffer.from([ 0x01, 0x00, 0x13, 0x00, 0x25 ]),
	crc           : Buffer.from([ 0x0E, 0x84 ]),
	lrc           : Buffer.from([ 0xB6 ]),
	transactionId : 1,
	protocol      : 0,
	unitId        : 255,
	slaveId       : 17
}, {
	name          : "read discrete inputs",
	pdu           : Buffer.from([ 0x02, 0x00, 0xC4, 0x00, 0x16 ]),
	crc           : Buffer.from([ 0xBA, 0xA9 ]),
	lrc           : Buffer.from([ 0x13 ]),
	transactionId : 2,
	protocol      : 1,
	unitId        : 254,
	slaveId       : 17
}, {
	name          : "read holding registers",
	pdu           : Buffer.from([ 0x03, 0x00, 0x6B, 0x00, 0x03 ]),
	crc           : Buffer.from([ 0x76, 0x87 ]),
	lrc           : Buffer.from([ 0x7E ]),
	transactionId : 3,
	protocol      : 2,
	unitId        : 253,
	slaveId       : 17
}, {
	name          : "read input registers",
	pdu           : Buffer.from([ 0x04, 0x00, 0x08, 0x00, 0x01 ]),
	crc           : Buffer.from([ 0xB2, 0x98 ]),
	lrc           : Buffer.from([ 0xE2 ]),
	transactionId : 4,
	protocol      : 3,
	unitId        : 252,
	slaveId       : 17
}, {
	name          : "write single coil",
	pdu           : Buffer.from([ 0x05, 0x00, 0xAC, 0xFF, 0x00 ]),
	crc           : Buffer.from([ 0x4E, 0x8B ]),
	lrc           : Buffer.from([ 0x3F ]),
	transactionId : 5,
	protocol      : 4,
	unitId        : 251,
	slaveId       : 17
}, {
	name          : "write single register",
	pdu           : Buffer.from([ 0x06, 0x00, 0x01, 0x00, 0x03 ]),
	crc           : Buffer.from([ 0x9A, 0x9B ]),
	lrc           : Buffer.from([ 0xE5 ]),
	transactionId : 6,
	protocol      : 5,
	unitId        : 250,
	slaveId       : 17
}, {
	name          : "write multiple coils",
	pdu           : Buffer.from([ 0x0F, 0x00, 0x13, 0x00, 0x0A, 0x02, 0xCD, 0x01 ]),
	crc           : Buffer.from([ 0xBF, 0x0B ]),
	lrc           : Buffer.from([ 0xF3 ]),
	transactionId : 7,
	protocol      : 6,
	unitId        : 249,
	slaveId       : 17
}, {
	name          : "write multiple registers",
	pdu           : Buffer.from([ 0x10, 0x00, 0x01, 0x00, 0x02, 0x04, 0x00, 0x0A, 0x01, 0x02 ]),
	crc           : Buffer.from([ 0xC6, 0xF0 ]),
	lrc           : Buffer.from([ 0xCB ]),
	transactionId : 8,
	protocol      : 7,
	unitId        : 248,
	slaveId       : 17
}];
