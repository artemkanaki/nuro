export class CloneHelper {
  public deepClone(obj) {
    let clone;
    if (this.isValidObject(obj)) {
      clone = {};
      Object.keys(obj).forEach(key => {
        if (typeof obj[key] === 'object') clone[key] = this.deepClone(obj[key]);
        else clone[key] = obj[key];
      });
    } else if (obj instanceof Array) {
      clone = [];
      obj.forEach(item => clone.push(this.deepClone(item)));
    } else {
      clone = obj;
    }
    return clone;
  }

  private isValidObject(obj) {
    return obj !== null && !(obj instanceof Array) && typeof obj === 'object';
  }
}