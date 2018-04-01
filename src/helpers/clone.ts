export class CloneHelper {
  public deepClone(obj: any): any {
    let clone: any;

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

  private isValidObject(obj: any) {
    // NOTICE: `obj.constructor.name === 'Object'` excludes classes, arrays and functions
    return obj !== null && obj.constructor.name === 'Object';
  }
}