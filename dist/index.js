'use strict';

var jsBase64 = require('js-base64');

const formats = [
  {
    t: 'time',
    s: {
      name: 'price',
      transformer: price => parseInt(price.replace('.', '')),
    },
    fn: 'fiscalNumber',
    i: 'fiscalDocument',
    fp: 'fiscalSign',
    n: 'checkType',
  },
];

function match(params, format) {
  const formatKeys = Object.keys(format);
  Object.keys(params).forEach(param => {
    if (!(param in formatKeys)) {
      return false;
    }
  });
  return true;
}

function extract(params, format) {
  const result = {};
  Object.keys(params).forEach(param => {
    const normal_name =
      typeof format[param] === 'string'
        ? format[param]
        : format[param].name;

    const transformer =
      typeof format[param] === 'string'
        ? el => el
        : format[param].transformer;

    result[normal_name] = transformer(params[param]);
  });
  return result;
}

function parseCheckString(qr_string) {
  const params = {};
  qr_string.split('&').forEach(param => {
    const [name, value] = param.split('=');
    params[name] = value;
  });
  const format = formats.find(_format => match(params, _format));
  if (format === null) {
    return null;
  }
  return extract(params, format);
}

const URL_CHECK = "https://proverkacheka.nalog.ru:9999/v1/ofds/*/inns/*/fss/<fiscalNumber>/operations/<checkType>/tickets/<fiscalDocument>?fiscalSign=<fiscalSign>&date=<time>&sum=<price>";
const URL_GET = "https://proverkacheka.nalog.ru:9999/v1/inns/*/kkts/*/fss/<fiscalNumber>/tickets/<fiscalDocument>?fiscalSign=<fiscalSign>&sendToEmail=no";


class ReceiptInfoGetter {
  constructor({ username, password, delay }) {
    this.username = username;
    this.password = password;
    this.delay = delay;
  }

  static makeUrl(url_template, params) {
    let url = url_template.slice();
    Object.keys(params).forEach(param => {
      url = url.replace(`<${param}>`, params[param]);
    });
    return url;
  }

  getHeaders() {
    return {
      'Authorization':
        'Basic ' + jsBase64.Base64.encode(this.username + ":" + this.password),
      'Device-Id': '',
      'Device-OS' : '',
    };
  }

  async request(url) {
    const fetcher = (typeof fetch !== 'undefined')
      ? fetch
      : require('node-fetch');
    return fetcher(
      url,
      {
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: this.getHeaders(),
        redirect: 'follow',
        referrer: 'no-referrer',
      }
    );
  }

  async get(qr_string) {
    try {
      const params = parseCheckString(qr_string);
      if (params === null) {
        return null;
      }

      const check_status = (await this.request(
        ReceiptInfoGetter.makeUrl(URL_CHECK, params)
      )).status;

      if (check_status === 204) {
        // delay required between check and get
        return new Promise((resolve) => {
          setTimeout(async () => {
            try {
              const result = (await this.request(
                ReceiptInfoGetter.makeUrl(URL_GET, params)
              ));
              resolve((await result.json()).document.receipt);
            } catch {
              resolve(null);
            }
          }, this.delay);
        });
      }
    } catch {}
    return null;
  }
}

module.exports = ReceiptInfoGetter;
