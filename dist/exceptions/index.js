"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class InvalidInputData extends Error {
    constructor(details, ...args) {
        super(...args);
        this.code = 'InvalidInputData';
        this.details = details;
        Error.captureStackTrace(this, InvalidInputData);
    }
}
exports.InvalidInputData = InvalidInputData;
class InputDataExpected extends Error {
    constructor(details, ...args) {
        super(...args);
        this.code = 'InputDataExpected';
        this.details = details;
        Error.captureStackTrace(this, InvalidInputData);
    }
}
exports.InputDataExpected = InputDataExpected;
class UnexpectedWorkFlow extends Error {
    constructor(details, ...args) {
        super(...args);
        this.code = 'UnexpectedWorkFlow';
        this.details = details;
        Error.captureStackTrace(this, InvalidInputData);
    }
}
exports.UnexpectedWorkFlow = UnexpectedWorkFlow;
//# sourceMappingURL=index.js.map