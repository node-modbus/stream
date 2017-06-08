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
