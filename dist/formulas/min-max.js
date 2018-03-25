"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const exceptions_1 = require("../exceptions");
class MinMaxHelper {
    getMinMaxConfig(data) {
        const minMax = {};
        if (!(data instanceof Array)) {
            throw new exceptions_1.InvalidInputData('`data` should be an array of objects');
        }
        Object.keys(lodash_1.head(data)).forEach(key => {
            lodash_1.set(minMax, `${key}.max`, lodash_1.get(lodash_1.maxBy(data, item => lodash_1.get(item, key)), key));
            lodash_1.set(minMax, `${key}.min`, lodash_1.get(lodash_1.minBy(data, item => lodash_1.get(item, key)), key));
        });
        return minMax;
    }
    getMinMaxFromArray(data) {
        const minMax = [];
        if (!(data instanceof Array)) {
            throw new exceptions_1.InvalidInputData('`data` should be an array of number arrays');
        }
        for (let index = 0; index < data[0].length; index++) {
            minMax[index] = [
                lodash_1.minBy(data, item => item[index])[index],
                lodash_1.maxBy(data, item => item[index])[index],
            ];
        }
        return minMax;
    }
}
exports.MinMaxHelper = MinMaxHelper;
//# sourceMappingURL=min-max.js.map