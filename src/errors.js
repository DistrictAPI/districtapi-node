'use strict';

class DistrictAPIError extends Error {
  constructor(message, statusCode, code) {
    super(message);
    this.name = 'DistrictAPIError';
    this.statusCode = statusCode ?? null;
    this.code = code ?? null;
  }
}

class NotFoundError extends DistrictAPIError {
  constructor(message, statusCode, code) {
    super(message, statusCode, code);
    this.name = 'NotFoundError';
  }
}

class AuthenticationError extends DistrictAPIError {
  constructor(message, statusCode, code) {
    super(message, statusCode, code);
    this.name = 'AuthenticationError';
  }
}

class RateLimitError extends DistrictAPIError {
  constructor(message, statusCode, code) {
    super(message, statusCode, code);
    this.name = 'RateLimitError';
  }
}

class InvalidParamsError extends DistrictAPIError {
  constructor(message, statusCode, code) {
    super(message, statusCode, code);
    this.name = 'InvalidParamsError';
  }
}

module.exports = {
  DistrictAPIError,
  NotFoundError,
  AuthenticationError,
  RateLimitError,
  InvalidParamsError,
};
