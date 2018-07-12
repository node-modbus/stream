var util = require('util')
var buffer = require('../buffer')
var BaseTransport = require('./transport')

function calculateModbusCRC16 (dataBuffer) {
  var POLY = 0xA001
  var SEED = 0xFFFF

  function CRC (buffer) {
    var crc = SEED
    for (var i = 0; i < buffer.length; i++) {
      crc = Calc_CRC(buffer[i], crc)
    }
    return crc
  }

  function Calc_CRC (b, crc) {
    crc ^= b & 0xFF
    for (var i = 0; i < 8; i++) {
      var carry = crc & 0x0001
      crc >>= 1
      if (carry) crc ^= POLY
    }
    return crc
  }

  function swap16 (val) {
    return ((val & 0xFF) << 8)
      | ((val >> 8) & 0xFF)
  }

  return swap16(CRC(dataBuffer))
}

function Transport (stream, options) {
  options = options || {}

  BaseTransport.call(this, stream, options)

  var transport = this

  this.transactionId = (typeof options.transactionId != 'undefined' ? options.transactionId : 1) - 1
  this.unitId = (typeof options.unitId != 'undefined' ? options.unitId : 1)
  this.protocol = (typeof options.protocol != 'undefined' ? options.protocol : 0)
  this.callbacks = {}
  this.buffer = null

  this.stream.on('end', function () {
    transport.emit('close')
  })
}

util.inherits(Transport, BaseTransport)

Transport.prototype.wrap = function (pdu, options, next) {
  options = options || {}
  next = next || null

  var unitId = (typeof options.unitId != 'undefined' ? options.unitId : this.unitId)

  var dataBuffer = buffer.alloc(pdu.length + 1)
  dataBuffer.writeUInt8(unitId, 0)
  pdu.copy(dataBuffer, 1)

  const dataCrc = calculateModbusCRC16(dataBuffer)

  const data = buffer.alloc(dataBuffer.length + 2)
  data.writeUInt16BE(dataCrc, 6)
  dataBuffer.copy(data, 0)

  if (typeof next == 'function') {
    var key = [unitId, pdu.readUInt8(0)].join(':')

    this.callbacks[key] = next

    data.__callback_key = key
  }

  return data
}

Transport.prototype.close = function (next) {
  this.closed = true

  this.stream.end(next)
}

Transport.prototype.pending = function () {
  return (this.buffer !== null && this.buffer.length)
}

Transport.prototype.unwrap = function (data) {
  this.buffer = data

  // not enough data to see package length
  if (this.buffer.length < 5) return false

  var length = this.buffer.length

  var unwrapped = {
    length: length,
    unitId: this.buffer.readUInt8(0),
    pdu: this.buffer.slice(1, length - 2),
    stream: this.stream
  }
  unwrapped.__callback_key = [unwrapped.unitId, unwrapped.pdu.readUInt8(0)].join(':')

  if (typeof this.callbacks[unwrapped.__callback_key] == 'function') {
    unwrapped.callback = this.callbacks[unwrapped.__callback_key]
    delete this.callbacks[unwrapped.__callback_key]
  }

  return unwrapped
}

Transport.prepare = function (options) {
  return function (stream) {
    return new Transport(stream, options)
  }
}

module.exports = Transport
