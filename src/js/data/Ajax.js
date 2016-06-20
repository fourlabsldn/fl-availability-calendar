import assert from 'fl-assert';

export default class Ajax {
  constructor(url) {
    assert(url, 'No URL provided on instantiation');
    this.url = url;
  }

  async query(params, url = this.url) {
    console.log('LOADING FROM SERVER', params);
    const requestUrl = this.addParametersToUrl(params, url);
    const requestConfig = {
      method: 'GET',
      cache: 'no-cache',
      // credentials: 'include',
    };

    const response = await fetch(requestUrl, requestConfig);
    const content = await response.json();
    return content;
  }

  /**
   * Adds parameters as GET string parameters to a prepared URL
   * @private
   * @method _addParametersToUrl
   * @param  {Object} params
   * @param  {String} url
   * @return {String} The full URL with parameters
   */
  // TODO: this must be more robust. What about www.asdf.com/, www.asdf.com/?, www.asdf.com
  addParametersToUrl(params, url = this.url) {
    const getParams = [];
    const keys = Object.keys(params);
    for (const key of keys) {
      const value = params[key] ? params[key].toString() : '';
      const encodedKey = encodeURIComponent(key);
      const encodedValue = encodeURIComponent(value);
      getParams.push(`${encodedKey}=${encodedValue}`);
    }

    const encodedGetParams = getParams.join('&');
    const fullUrl = `${url}?${encodedGetParams}`;
    return fullUrl;
  }
}
