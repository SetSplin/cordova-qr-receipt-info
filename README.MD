# qr-receipt-info

> Get Russian receipt info using string from qr code

[![NPM Version][npm-image]][npm-url]

## Install

Via `npm`
```bash
npm i -S qr-receipt-info
```

Via `yarn`
```bash
yarn add qr-receipt-info
```

## Usage

To get info you need to register in [mobile app](https://kkt-online.nalog.ru/).

```javascript
import ReceiptInfoGetter from 'qr-receipt-info';


const qr_string =
  't=<number>&s=<number>&fn=<number>&i=<number>&fp=<number>&n=<number>'; // string from qr code

const receiptInfo = new ReceiptInfoGetter({
  username: '+79999999999', // phone that you used to register
  password: '000000', // password that you received in sms
  delay: 500, // delay between queries (to get info getter makes two queries)
  // is necessary so as not to get an error from the server
})

receiptInfo.get(qr_string).then(
  info => {
    if (info) { // null if not found
      info.items.forEach(el => console.log(el));
    }
  }
);
```

## License

[MIT](http://vjpr.mit-license.org)

[npm-image]: https://img.shields.io/npm/v/qr-receipt-info.svg
[npm-url]: https://npmjs.org/package/qr-receipt-info
