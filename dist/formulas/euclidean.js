"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const exceptions_1 = require("../exceptions");
const math = require("mathjs");
class Euclidean {
    getEuclideanDistance(from, to) {
        const coordinatesName = Object.keys(from);
        const invalidCoordinates = Object.keys(to).filter(key => !coordinatesName.includes(key));
        if (invalidCoordinates.length) {
            throw new exceptions_1.InvalidInputData('Both parameters should have equal keys, instead the second one has extra fields: ' + invalidCoordinates.join());
        }
        return coordinatesName
            .reduce((total, key) => {
            const fromKey = from[key];
            const toKey = to[key];
            return total
                .add(math
                .chain(fromKey)
                .subtract(toKey)
                .pow(2)
                .done());
        }, math.chain(0))
            .sqrt()
            .done();
    }
}
exports.default = Euclidean;
//# sourceMappingURL=euclidean.js.map