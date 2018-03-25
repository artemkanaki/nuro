"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const mathjs_1 = require("mathjs");
class DenormalizeHelper {
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
    denormalizeArray(target, minMax) {
        const denormalized = [];
        target.forEach((value, index) => {
            const min = minMax[index][0];
            const max = minMax[index][1];
            const denormalize = min < 0 ? this.extended : this.standard;
            denormalized[index] = denormalize.call(this, min, max, value);
        });
        return denormalized;
    }
}
exports.DenormalizeHelper = DenormalizeHelper;
//# sourceMappingURL=denormalize.js.map