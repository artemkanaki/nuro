export class InvalidInputData extends Error {
  public code: string;
  public details: string;

  constructor(details, ...args) {
    super(...args);
    this.code = 'InvalidInputData';
    this.details = details;
    Error.captureStackTrace(this, InvalidInputData);
  }
}

export class InputDataExpected extends Error {
  public code: string;
  public details: string;

  constructor(details, ...args) {
    super(...args);
    this.code = 'InputDataExpected';
    this.details = details;
    Error.captureStackTrace(this, InvalidInputData);
  }
}

export class UnexpectedWorkFlow extends Error {
  public code: string;
  public details: string;

  constructor(details, ...args) {
    super(...args);
    this.code = 'UnexpectedWorkFlow';
    this.details = details;
    Error.captureStackTrace(this, InvalidInputData);
  }
}