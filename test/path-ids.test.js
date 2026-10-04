'use strict';

/**
 * Path-injection tests for identifiers interpolated into request paths.
 *
 * Each identifier must be rejected with a TypeError before any request is
 * sent; otherwise an id like "../../v2/internal/admin" redirects the request,
 * with the caller's API key, to another path on the API host. Offline: fetch
 * is stubbed, so no API key or network access is needed.
 *
 *   node --test test/path-ids.test.js
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const { DistrictAPI, NotFoundError } = require('..');

const BAD_IDS = [
  '../../v2/internal/admin',
  '..',
  '.',
  'a/b',
  '0600017?admin=1',
  '0600017#frag',
  '%2e%2e',
  '0600017\n',
  '0600017 ',
  '',
  'a'.repeat(65),
  '\u0661\u0662\u0663', // non-ASCII digits
  undefined,
  null,
  true,
  {},
  ['0600017'],
];

const CALLS = [
  ['districts.fetch', (c, id) => c.districts.fetch(id), '0600017', '/v1/districts/0600017'],
  ['districts.schools', (c, id) => c.districts.schools(id), '0600017', '/v1/districts/0600017/schools'],
  ['schools.fetch', (c, id) => c.schools.fetch(id), '060001709098', '/v1/schools/060001709098'],
  ['schools.district', (c, id) => c.schools.district(id), '060001709098', '/v1/schools/060001709098/district'],
];

// Stub fetch for the duration of fn; returns the URLs it was asked to fetch.
async function recordFetches(fn) {
  const sent = [];
  const realFetch = globalThis.fetch;
  globalThis.fetch = async (url) => {
    sent.push(new URL(url));
    return new Response(JSON.stringify({ detail: { message: 'not found', code: 'NOT_FOUND' } }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  };
  try {
    await fn();
  } finally {
    globalThis.fetch = realFetch;
  }
  return sent;
}

for (const [name, call, good, path] of CALLS) {
  for (const bad of BAD_IDS) {
    test(`${name} rejects ${JSON.stringify(bad) ?? String(bad)} before sending`, async () => {
      const sent = await recordFetches(() =>
        assert.rejects(call(new DistrictAPI('test'), bad), (err) => {
          assert.ok(err instanceof TypeError, `expected TypeError, got ${err && err.name}`);
          assert.match(err.message, /must contain only letters, digits/);
          return true;
        }),
      );
      assert.deepEqual(sent, []);
    });
  }

  test(`${name} sends a real id to ${path}`, async () => {
    const sent = await recordFetches(() =>
      assert.rejects(call(new DistrictAPI('test'), good), NotFoundError),
    );
    assert.deepEqual(sent.map((u) => [u.host, u.pathname, u.search]), [['api.districtapi.dev', path, '']]);
  });
}

test('numeric id is still accepted', async () => {
  const sent = await recordFetches(() =>
    assert.rejects(new DistrictAPI('test').districts.fetch(3600076), NotFoundError),
  );
  assert.deepEqual(sent.map((u) => u.pathname), ['/v1/districts/3600076']);
});
