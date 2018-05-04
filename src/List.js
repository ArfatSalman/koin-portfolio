class List {
  constructor(maxSize) {
    // console.log(maxSize, typeof maxSize);s
    if (typeof maxSize !== 'number' || maxSize < 1) {
      throw new Error('please specify maxSize');
    }

    this.arr = [];
    this._maxSize = maxSize;
    this._index = 0;
  }
  * [Symbol.iterator]() {
    for (const val of this.arr) {
      yield val;
    }
  }
  insert(item) {
    this.arr.splice(0, 0, item);
    if (this._index === this._maxSize) {  
      this.arr.pop();
    } else {
      this._index++;
    }
  }
  get array() {
    return this.arr;
  }
}

module.exports = List;
