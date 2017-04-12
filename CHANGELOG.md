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
