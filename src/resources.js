'use strict';

class DistrictResource {
  /** @param {Function} request */
  constructor(request) {
    this._req = request;
  }

  /**
   * Look up the school district for an address, coordinates, or NCES LEA ID.
   *
   * @param {Object} params
   * @param {string} [params.address]   Street address (geocoded server-side)
   * @param {number} [params.lat]       Latitude (must pair with lng)
   * @param {number} [params.lng]       Longitude (must pair with lat)
   * @param {string} [params.ncesId]    7-digit NCES LEA ID
   * @returns {Promise<Object>}
   */
  async get({ address, lat, lng, ncesId } = {}) {
    const p = {};
    if (address !== undefined) p.address = address;
    if (lat !== undefined) p.lat = lat;
    if (lng !== undefined) p.lng = lng;
    if (ncesId !== undefined) p.nces_id = ncesId;
    const body = await this._req('GET', '/v1/districts', p);
    return body.data;
  }

  /**
   * Fetch a district by its 7-digit NCES LEA ID.
   *
   * @param {string} ncesId
   * @returns {Promise<Object>}
   */
  async fetch(ncesId) {
    const body = await this._req('GET', `/v1/districts/${ncesId}`);
    return body.data;
  }

  /**
   * List all open schools in a district.
   *
   * @param {string} ncesId  7-digit NCES LEA ID
   * @returns {Promise<Object[]>}
   */
  async schools(ncesId) {
    const body = await this._req('GET', `/v1/districts/${ncesId}/schools`);
    return body.data;
  }

  /**
   * Search districts by name, state, and/or county.
   *
   * @param {Object} [params]
   * @param {string} [params.name]
   * @param {string} [params.state]    Two-letter state code (e.g. "CA")
   * @param {string} [params.county]
   * @param {number} [params.limit=20]
   * @param {number} [params.offset=0]
   * @returns {Promise<Object[]>}
   */
  async search({ name, state, county, limit = 20, offset = 0 } = {}) {
    const p = { limit, offset };
    if (name !== undefined) p.name = name;
    if (state !== undefined) p.state = state;
    if (county !== undefined) p.county = county;
    const body = await this._req('GET', '/v1/districts/search', p);
    return body.data;
  }
}

class SchoolResource {
  /** @param {Function} request */
  constructor(request) {
    this._req = request;
  }

  /**
   * Fetch a school by its 12-digit NCES school ID.
   *
   * @param {string} ncesId
   * @returns {Promise<Object>}
   */
  async fetch(ncesId) {
    const body = await this._req('GET', `/v1/schools/${ncesId}`);
    return body.data;
  }

  /**
   * Find schools near an address or coordinates.
   *
   * @param {Object} params
   * @param {string} [params.address]
   * @param {number} [params.lat]
   * @param {number} [params.lng]
   * @param {number} [params.radiusMiles=5]
   * @param {number} [params.limit=20]
   * @returns {Promise<Object[]>}
   */
  async near({ address, lat, lng, radiusMiles = 5, limit = 20 } = {}) {
    const p = { radius_miles: radiusMiles, limit };
    if (address !== undefined) p.address = address;
    if (lat !== undefined) p.lat = lat;
    if (lng !== undefined) p.lng = lng;
    const body = await this._req('GET', '/v1/schools', p);
    return body.data;
  }

  /**
   * Get the district that a school belongs to.
   *
   * @param {string} ncesId  12-digit NCES school ID
   * @returns {Promise<Object>}
   */
  async district(ncesId) {
    const body = await this._req('GET', `/v1/schools/${ncesId}/district`);
    return body.data;
  }
}

module.exports = { DistrictResource, SchoolResource };
