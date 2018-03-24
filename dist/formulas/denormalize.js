"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const mathjs_1 = require("mathjs");
class Denormalize {
    standard(min, max, target) {
        return mathjs_1.chain(max)
            .subtract(min)
            .multiply(target)
            .add(min)
            .done();
    }
    extended(min, max, target) {
        return mathjs_1.chain(target)
            .subtract(1)
            .multiply(2)
            .multiply(mathjs_1.chain(max).subtract(min))
            .subtract(min)
            .done();
    }
    denormalizeObject(target, minMax) {
        const denormalized = {};
        Object.keys(target).forEach(key => {
            const value = lodash_1.get(target, key);
            const min = lodash_1.get(minMax, key).min;
            const max = lodash_1.get(minMax, key).max;
            const denormalize = min < 0 ? this.extended : this.standard;
            lodash_1.set(denormalized, key, denormalize.call(this, min, max, value));
        });
        return denormalized;
    }
}
exports.default = Denormalize;
//# sourceMappingURL=denormalize.js.map