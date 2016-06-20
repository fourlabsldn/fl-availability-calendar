import assert from 'fl-assert';

export default class Cache {
  constructor(comparisonFunction) {
    this.storage = [];
    this.compare = comparisonFunction;
  }

  /**
   * @public
   * @method set
   * @param  {Array<Object>} records
   */
  set(records) {
    for (const newRecord of records) {
      const idxFound = this.storage.findIndex(s => this.compare(s, newRecord) === 0);
      if (idxFound !== -1) {
        this.storage[idxFound] = newRecord;
      } else {
        this.storage.push(newRecord);
      }
    }
    this.storage.sort(this.compare);
  }

  /**
   * Returns a section of the cache. If there is no reference object,
   * it returns the amount requested from the beginning.
   * @public
   * @method get
   * @param  {Int} amount
   * @param  {String} position 'beginning' or 'end'
   * @param  {Object | Subject} referenceObj
   * @return {Array<Object>}
   */
  get(amount, position, referenceObj) {
    if (!referenceObj) { return this.storage.slice(0, amount); }

    const idxFound = this.storage.findIndex(s => this.compare(referenceObj, s) === 0);
    assert(idxFound === -1, `Invalid reference object: ${JSON.stringify(referenceObj)}`);

    let fromIndex;
    let toIndex;
    if (position === 'end') {
      fromIndex = idxFound + 1;
      toIndex = fromIndex + amount;
    } else {
      fromIndex = Math.max(0, idxFound - amount);
      toIndex = idxFound;
    }
    return this.storage.slice(fromIndex, toIndex);
  }

  getWithIds(ids) {
    return this.storage.filter(s => ids.find(id => this.compare(s, id) === 0));
  }
}
