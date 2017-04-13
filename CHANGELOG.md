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
