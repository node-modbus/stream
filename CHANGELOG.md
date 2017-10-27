## 0.39.0 - 27 Oct 2017

- transport:
  - expose `stream` in events

## 0.38.0 - 19 Sep 2017

- tcp:
  - add a connection timeout option, `connectTimeout` (default=10s) (@jhillacre)
- ci:
  -  drop node 0.x, adds v8 (I still make efforts to it works on 0.x)

## 0.37.0 - 15 Sep 2017

- transport:
  - serial:
    - allow default slaveId to be passed in constructor
  - tcp:
    - allow default unitId to be passed in constructor (fixes #8)
- deps:
  - mocha@3.5.3

## 0.36.0 - 21 Jul 2017

- tcp: fixes #7

## 0.35.0 - 20 Jul 2017

- transport:
  - allow multiple retry timers, allowing tcp to requests to go simultaneously (#6)
- test:
  - change quirks to split each transport and avoid confusion
  - avoids using reserved word `package` (fixes #5)

## 0.34.0 - 6 Jul 2017

- serial:
  - allow to pass any option that you can use in serialport
  - avoid clearing buffer if it's already cleared

## 0.33.0 - 4 Jul 2017

- transport:
  - pass options also to transport to be able to set options there
- serial:
  - adds maxDataInterval (in ms) between received data blocks

## 0.32.0 - 4 Jul 2017

- serial:
  - allow option crc=false to be able to send raw data
  - fixes dropping data with less than 4 bytes

## 0.31.0 - 4 Jul 2017

- serial:
  - allow to pass lock option

## 0.30.0 - 4 Jul 2017

- tcp:
  - handle packages concatenated in one data event

## 0.29.0 - 4 Jul 2017

- tcp:
  - fixes previous commit not properly handling exceptions as it should

## 0.28.0 - 4 Jul 2017

- tcp:
  - fixes callbacks not working for exception responses

## 0.27.0 - 3 Jul 2017

- transport:
  - adds support for a mutex

## 0.26.0 - 3 Jul 2017

- transport:
  - exposes `close` event
- readme:
  - adds events section

## 0.25.0 - 30 Jun 2017

- transport:
  - propagate error event from stream (#4)
  - store closed state and avoid send data to a closed stream (#4)

## 0.24.0 - 27 Jun 2017

- tcp:
  - ensure tcp properly splits packages that come together
- test:
  - adds quirk tests, fixes double callback invocation
- deps:
  - modbus-pdu@1.11.0

## 0.23.0 - 26 Jun 2017

- transport:
  - fixes tcp not clearing before new retries

## 0.22.0 - 26 Jun 2017

- deps:
  - modbus-pdu@1.10.0

## 0.21.0 - 26 Jun 2017

- transport:
  - tcp callback now matches transaction+unit+fcode
  - fixes utf8 non visible whitespace

## 0.20.0 - 23 Jun 2017

- deps:
  - modbus-pdu@1.9.0

## 0.19.0 - 22 Jun 2017

- stream:
  - adds option debuginvert to invert the arrows in incoming/outgoing debug lines
  - adds option debugdate that when passed false will not print date in debug lines
- transport:
  - fixes replies with unknown function codes
- deps:
  - modbus-pdu@1.8.4

## 0.18.0 - 20 Jun 2017

- udp:
  - initial support
- test:
  - adds node v5, disable node v8 for now, adds node_modules to cache

## 0.17.0 - 14 Jun 2017

- transport:
  - tcp:
    - fixes calling socket.close() instead of socket.end()
- modbus:
  - pass all options to tcp transport (fixes #3)

## 0.16.0 - 12 Jun 2017

- transport:
  - serial:
    - adds support for data coming in parts (checking CRC match)

## 0.15.0 - 8 Jun 2017

- transport:
  - fixes timeout error returned not having a proper code
  - tcp:
    - return a proper code when not being able to connect to remote host/port
  - serial:
    - return a proper code when not being able to open port
- stream:
  - add iso date to debug lines
- test:
  - adds node v8
- deps:
  - modbus-pdu@1.8.3
  - mocha@3.4.2

## 0.14.4 - 19 May 2017

- deps:
  - mocha@3.4.1 (previous update was erroneous)

## 0.14.3 - 19 May 2017

- deps:
  - mocha@3.4.2
  - modbus-pdu@1.8.2

## 0.14.2 - 11 May 2017

- stream:
  - fixes typo in addres
- deps:
  - mocha@3.3.0

## 0.14.1 - 27 Apr 2017

- deps:
  - modbus-pdu@1.8.1

## 0.14.0 - 20 Apr 2017

- deps:
  - modbus-pdu@1.8.0

## 0.13.0 - 13 Apr 2017

- transport:
  - ascii:
    - check slave id response match
  - serial:
    - check slave id response match

## 0.12.0 - 13 Apr 2017

- transport:
  - changes beforewrite/afterwrite to beforerequest/afterrequest

## 0.11.0 - 13 Apr 2017

- stream:
  - adds close(next)
- deps:
  - modbus-pdu@1.7.0

## 0.10.0 - 13 Apr 2017

- serial:
  - adds support for serialport from 1.7.1 and above
- transport:
  - only stop retry timer if transport unwrap returns ok
  - serial:
    - avoid errors when receiving data with less than 3 bytes

## 0.9.0 - 13 Apr 2017

- transport:
  - fixes static method prepare()
  - fixes transport send using prototype.apply instead of prototype.call
- stream:
  - fixes typo of addres

## 0.8.0 - 13 Apr 2017

- node:
  - updates code to work properly on 0.10
- readme:
  - removes v6 reference since now it should work from 0.10 onwards

## 0.7.0 - 13 Apr 2017

- node:
  - adds support for at least v0.10
- transports:
  - return an error (GatewayTargetDeviceFailedToRespond) after retries run out
  - adds support for beforewrite and afterwrite
  - tcp:
    - adds default retry timeout to 30 seconds
- deps:
  - modbus-pdu@1.5.1

## 0.6.0 - 12 Apr 2017

- modbus:
  - adds serial options for retrying
  - expose stream and pdu (modbus-pdu module)
- stream:
    - wrap data when using write() directly
- transport:
    - support request codes that pdu does not know
- deps:
    - modbus-pdu@1.4.0

## 0.5.0 - 31 Mar 2017

- initial stable version
- transports:
  - ascii
  - serial
  - tcp
- drivers:
  - rtu
  - tcp
