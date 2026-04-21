'use strict';

const { request, VERSION } = require('./src/http');
const { DistrictResource, SchoolResource } = require('./src/resources');
const {
  DistrictAPIError,
  NotFoundError,
  AuthenticationError,
  RateLimitError,
  InvalidParamsError,
} = require('./src/errors');

const BASE_URL = 'https://api.districtapi.dev';

/**
 * Official Node.js client for districtapi.dev.
 *
 * Requires Node.js 18+ (uses native fetch).
 *
 * @example
 * const { DistrictAPI } = require('districtapi');
 * const client = new DistrictAPI('sk_live_...');
 *
 * const district = await client.districts.get({ address: '123 Main St, Apple Valley, CA' });
 * console.log(district.name);
 *
 * const schools = await client.districts.schools(district.ncesId);
 */
class DistrictAPI {
  /**
   * @param {string} apiKey     Your API key from districtapi.dev/dashboard
   * @param {Object} [options]
   * @param {string} [options.baseUrl='https://api.districtapi.dev']
   * @param {number} [options.timeout=30000]  Request timeout in milliseconds
   */
  constructor(apiKey, { baseUrl = BASE_URL, timeout = 30000 } = {}) {
    if (!apiKey) throw new Error('apiKey is required');

    const req = (method, path, params) =>
      request(baseUrl, apiKey, timeout, method, path, params);

    /** @type {DistrictResource} */
    this.districts = new DistrictResource(req);

    /** @type {SchoolResource} */
    this.schools = new SchoolResource(req);
  }
}

module.exports = {
  DistrictAPI,
  VERSION,
  DistrictAPIError,
  NotFoundError,
  AuthenticationError,
  RateLimitError,
  InvalidParamsError,
};
