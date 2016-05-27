import assert from 'fl-assert';

export default class DataLoader {
  /**
   * @method constructor
   * @param  {String} loadUrl - Url from where to fetch data
   * @return {DataLoader}
   */
  constructor(loadUrl) {
    this.loadUrl = loadUrl;
    Object.preventExtensions(this);
  }

  /**
   * Fetches data from the server
   * @method load
   * @param  {CustomDate} fromDate
   * @param  {CustomDate} endDate
   * @param  {Array<String>} ids - Subject ids
   * @param  {Int} [idCountToLoad] - How many new ids to be loaded
   * @param  {String} [Method]
   * @return {Promise<Object>}
   */
  load(fromDate, endDate, ids, idCountToLoad = 0, method = 'GET') {
    return fetch(this.loadUrl, {
      method,
    })
    .then((res) => res.json())
    .catch((err) => assert(false, err));
  }
}
