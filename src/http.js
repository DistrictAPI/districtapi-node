'use strict';

const { DistrictAPIError, NotFoundError, AuthenticationError, RateLimitError, InvalidParamsError } = require('./errors');

const VERSION = '0.2.0';

/**
 * Make an authenticated request to the DistrictAPI.
 *
 * @param {string} baseUrl
 * @param {string} apiKey
 * @param {number} timeout  Milliseconds
 * @param {string} method
 * @param {string} path
 * @param {Object} [params]
 * @returns {Promise<Object>}
 */
async function request(baseUrl, apiKey, timeout, method, path, params) {
  const url = new URL(path, baseUrl);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null) {
        url.searchParams.set(k, String(v));
      }
    }
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  let res;
  try {
    res = await fetch(url.toString(), {
      method,
      headers: {
        'X-API-Key': apiKey,
        'User-Agent': `districtapi-node/${VERSION}`,
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timer);
    if (err.name === 'AbortError') {
      throw new DistrictAPIError(`Request timed out after ${timeout}ms`);
    }
    throw new DistrictAPIError(err.message);
  }
  clearTimeout(timer);

  let body;
  try {
    body = await res.json();
  } catch {
    body = {};
  }

  if (!res.ok) {
    const detail = body.detail;
    const msg = typeof detail === 'string'
      ? detail
      : (detail?.message ?? res.statusText ?? 'Unknown error');
    const code = typeof detail === 'object' ? (detail?.code ?? null) : null;

    if (res.status === 401) throw new AuthenticationError(msg, res.status, code);
    if (res.status === 404) throw new NotFoundError(msg, res.status, code);
    if (res.status === 429) throw new RateLimitError(msg, res.status, code);
    if (res.status === 400) throw new InvalidParamsError(msg, res.status, code);
    throw new DistrictAPIError(msg, res.status, code);
  }

  return body;
}

module.exports = { request, VERSION };
