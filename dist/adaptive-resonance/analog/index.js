"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const clone_1 = require("../../helpers/clone");
const normalize_1 = require("../../formulas/normalize");
const denormalize_1 = require("../../formulas/denormalize");
class AnalogAdaptiveResonance {
    constructor() {
        this._range = .6;
        this.cloneHelper = new clone_1.CloneHelper();
        this.normalizeHelper = new normalize_1.NormalizeHelper();
        this.denormalizeHelper = new denormalize_1.DenormalizeHelper();
    }
    get range() {
        return this._range;
    }
    set range(val) {
        this._range = val;
    }
}
exports.AnalogAdaptiveResonance = AnalogAdaptiveResonance;
//# sourceMappingURL=index.js.map