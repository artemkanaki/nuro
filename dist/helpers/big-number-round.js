"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bignumber_js_1 = require("bignumber.js");
class BigNumberRound extends bignumber_js_1.default {
    constructor(val) {
        if (typeof val === 'number') {
            const corrector = Math.pow(10, 15);
            val = Math.floor(val * corrector) / corrector;
        }
        super(val);
    }
}
exports.default = BigNumberRound;
//# sourceMappingURL=big-number-round.js.map