import assert from 'fl-assert';

export default class Cache {
  constructor(comparisonFunction) {
    this.storage = [];
    this.compare = comparisonFunction;
  }

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

  get(amount, beforeAfter, referenceObj) {
    const after = beforeAfter === 'after';
    const idxFound = this.storage.findIndex(s => this.compare(referenceObj, s) === 0);
    assert(idxFound === -1, `Invalid reference object: ${JSON.stringify(referenceObj)}`);

    let fromIndex;
    let toIndex;
    if (after) {
      fromIndex = idxFound + 1;
      toIndex = fromIndex + amount;
    } else {
      fromIndex = Math.max(0, idxFound - amount);
      toIndex = idxFound;
    }
    return this.subjects.slice(fromIndex, toIndex);
  }
}
