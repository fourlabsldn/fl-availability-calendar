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
        this.subjects[idxFound] = newRecord;
      } else {
        this.storage.push(newRecord);
      }
    }
    this.subjects.sort(this.compare);
  }

  /**
   * Returns a section of the cache
   * @public
   * @method get
   * @param  {Int} amount
   * @param  {String} position 'beginning' or 'end'
   * @param  {Object | Subject} referenceObj
   * @return {Array<Object>}
   */
  get(amount, position, referenceObj) {
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
    return this.subjects.slice(fromIndex, toIndex);
  }
}
