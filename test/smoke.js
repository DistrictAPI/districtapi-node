'use strict';

const { DistrictAPI, NotFoundError, AuthenticationError, InvalidParamsError } = require('../index');

const API_KEY = process.env.DISTRICTAPI_KEY;
if (!API_KEY) {
  console.error('Set DISTRICTAPI_KEY env var to run smoke tests');
  process.exit(1);
}
const client = new DistrictAPI(API_KEY);

let passed = 0;
let failed = 0;

async function test(label, fn) {
  try {
    await fn();
    console.log(`  ✓ ${label}`);
    passed++;
  } catch (err) {
    console.log(`  ✗ ${label}: ${err.message}`);
    failed++;
  }
}

async function main() {
  console.log('\nDistrictAPI Node SDK smoke tests\n');

  await test('districts.fetch by NCES ID', async () => {
    const d = await client.districts.fetch('0600017');
    if (d.ncesId !== '0600017') throw new Error(`Expected ncesId 0600017, got ${d.ncesId}`);
    if (!d.name) throw new Error('Missing name');
    if (!d.geo?.lat) throw new Error('Missing geo.lat');
    if (!d.enrollment?.total) throw new Error('Missing enrollment.total');
  });

  await test('districts.get by address', async () => {
    const d = await client.districts.get({ address: '12555 Navajo Rd, Apple Valley, CA 92308' });
    if (d.ncesId !== '0600017') throw new Error(`Expected 0600017, got ${d.ncesId}`);
  });

  await test('districts.get by lat/lng', async () => {
    const d = await client.districts.get({ lat: 34.48, lng: -117.19 });
    if (d.ncesId !== '0600017') throw new Error(`Expected 0600017, got ${d.ncesId}`);
  });

  await test('districts.search by state', async () => {
    const results = await client.districts.search({ state: 'CA', limit: 5 });
    if (!Array.isArray(results)) throw new Error('Expected array');
    if (results.length === 0) throw new Error('Expected results');
    if (!results[0].ncesId) throw new Error('Missing ncesId in result');
  });

  await test('districts.schools', async () => {
    const schools = await client.districts.schools('0600017');
    if (!Array.isArray(schools)) throw new Error('Expected array');
    if (schools.length === 0) throw new Error('Expected schools');
    if (!schools[0].ncesId) throw new Error('Missing ncesId');
  });

  await test('schools.fetch by NCES ID', async () => {
    const s = await client.schools.fetch('060001709098');
    if (!s.ncesId) throw new Error('Missing ncesId');
    if (!s.name) throw new Error('Missing name');
  });

  await test('schools.near by lat/lng', async () => {
    const schools = await client.schools.near({ lat: 34.48, lng: -117.19, limit: 5 });
    if (!Array.isArray(schools)) throw new Error('Expected array');
    if (schools.length === 0) throw new Error('Expected schools');
  });

  await test('schools.district', async () => {
    const d = await client.schools.district('060001709098');
    if (!d.ncesId) throw new Error('Missing ncesId');
  });

  // Error handling
  await test('404 throws NotFoundError', async () => {
    try {
      await client.districts.fetch('9999999');
      throw new Error('Should have thrown');
    } catch (err) {
      if (!(err instanceof NotFoundError)) throw new Error(`Expected NotFoundError, got ${err.name}`);
    }
  });

  await test('401 throws AuthenticationError', async () => {
    const bad = new DistrictAPI('bad_key');
    try {
      await bad.districts.fetch('0600017');
      throw new Error('Should have thrown');
    } catch (err) {
      if (!(err instanceof AuthenticationError)) throw new Error(`Expected AuthenticationError, got ${err.name}`);
    }
  });

  await test('400 throws InvalidParamsError', async () => {
    try {
      await client.districts.get({});
      throw new Error('Should have thrown');
    } catch (err) {
      if (!(err instanceof InvalidParamsError)) throw new Error(`Expected InvalidParamsError, got ${err.name}`);
    }
  });

  await test('missing apiKey throws at construction', async () => {
    try {
      new DistrictAPI('');
      throw new Error('Should have thrown');
    } catch (err) {
      if (err.message !== 'apiKey is required') throw err;
    }
  });

  console.log(`\n  ${passed}/${passed + failed} passed\n`);
  if (failed > 0) process.exit(1);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
