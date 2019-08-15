import parseReceiptString from './parseReceiptString';


const URL_CHECK = "https://proverkacheka.nalog.ru:9999/v1/ofds/*/inns/*/fss/<fiscalNumber>/operations/<checkType>/tickets/<fiscalDocument>?fiscalSign=<fiscalSign>&date=<time>&sum=<price>";
const URL_GET = "https://proverkacheka.nalog.ru:9999/v1/inns/*/kkts/*/fss/<fiscalNumber>/tickets/<fiscalDocument>?fiscalSign=<fiscalSign>&sendToEmail=no";


export default class ReceiptInfoGetter {
  constructor({ username, password, delay }) {
    cordova.plugin.http.useBasicAuth(username, password);
    cordova.plugin.http.setHeader('Device-Id', '');
    cordova.plugin.http.setHeader('Device-OS', '');
    this.delay = delay;
  }

  static makeUrl(url_template, params) {
    let url = url_template.slice();
    Object.keys(params).forEach(param => {
      url = url.replace(`<${param}>`, params[param]);
    });
    return url;
  }

  async request(url) {
    return new Promise(
      (resolve, reject) => {
        cordova.plugin.http.sendRequest(
          url,
          { method: 'get' },
          resolve,
          reject,
        );
      }
    );
  }

  async get(qr_string) {
    try {
      const params = parseReceiptString(qr_string);
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
