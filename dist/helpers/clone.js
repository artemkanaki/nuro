"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Clone {
    deepClone(obj) {
        let clone;
        if (this.isValidObject(obj)) {
            clone = {};
            Object.keys(obj).forEach(key => {
                if (typeof obj[key] === 'object')
                    clone[key] = this.deepClone(obj[key]);
                else
                    clone[key] = obj[key];
            });
        }
        else if (obj instanceof Array) {
            clone = [];
            obj.forEach(item => clone.push(this.deepClone(item)));
        }
        else {
            console.warn('Input object has invalid type');
            clone = obj;
        }
        return clone;
    }
    isValidObject(obj) {
        return obj !== null && !(obj instanceof Array) && typeof obj === 'object';
    }
}
exports.default = Clone;
//# sourceMappingURL=clone.js.map