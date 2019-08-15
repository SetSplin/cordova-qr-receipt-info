"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = parseCheckString;
const formats = [{
  t: 'time',
  s: {
    name: 'price',
    transformer: price => parseInt(price.replace('.', ''))
  },
  fn: 'fiscalNumber',
  i: 'fiscalDocument',
  fp: 'fiscalSign',
  n: 'checkType'
}];

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
    const normal_name = typeof format[param] === 'string' ? format[param] : format[param].name;
    const transformer = typeof format[param] === 'string' ? el => el : format[param].transformer;
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