# districtapi

Official Node.js SDK for [districtapi.dev](https://districtapi.dev) — US school district and school data API.

**Requires Node.js 18+** (uses native `fetch`). No external dependencies.

## Installation

```bash
npm install districtapi
```

## Quick start

```js
const { DistrictAPI } = require('districtapi');

const client = new DistrictAPI('sk_live_...');

// Address → district (the killer feature)
const district = await client.districts.get({
  address: '123 Main St, Apple Valley, CA'
});
console.log(district.name);          // "Apple Valley Unified"
console.log(district.enrollment);    // { total: 13639, year: '2024-25', demographics: {...} }
console.log(district.geo.boundary);  // GeoJSON MultiPolygon

// Schools in a district
const schools = await client.districts.schools(district.ncesId);
console.log(schools.length);         // 15

// Schools near a point
const nearby = await client.schools.near({ lat: 34.48, lng: -117.19, radiusMiles: 3 });
```

Get your free API key at [districtapi.dev/dashboard](https://districtapi.dev/dashboard).

## API reference

### `new DistrictAPI(apiKey, [options])`

| Option | Default | Description |
|--------|---------|-------------|
| `baseUrl` | `https://api.districtapi.dev` | API base URL |
| `timeout` | `30000` | Request timeout in ms |

---

### `client.districts`

#### `.get(params)` → `Promise<District>`

Look up the school district for an address, coordinates, or NCES LEA ID. Exactly one of `address`, `lat`+`lng`, or `ncesId` is required.

```js
// By address
await client.districts.get({ address: '1600 Amphitheatre Pkwy, Mountain View, CA' });

// By coordinates
await client.districts.get({ lat: 37.422, lng: -122.084 });

// By NCES LEA ID
await client.districts.get({ ncesId: '0600017' });
```

#### `.fetch(ncesId)` → `Promise<District>`

Fetch a district by its 7-digit NCES LEA ID.

```js
await client.districts.fetch('0600017');
```

#### `.schools(ncesId)` → `Promise<School[]>`

List all open schools in a district.

```js
const schools = await client.districts.schools('0600017');
```

#### `.search(params)` → `Promise<DistrictSummary[]>`

Search districts by name, state, and/or county.

```js
await client.districts.search({ name: 'apple valley', state: 'CA' });
await client.districts.search({ state: 'TX', limit: 50 });
```

| Param | Type | Description |
|-------|------|-------------|
| `name` | string | Full-text district name search |
| `state` | string | Two-letter state code |
| `county` | string | County name (partial match) |
| `limit` | number | Default `20`, max `100` |
| `offset` | number | Default `0` |

---

### `client.schools`

#### `.fetch(ncesId)` → `Promise<School>`

Fetch a school by its 12-digit NCES school ID.

```js
await client.schools.fetch('060001709098');
```

#### `.near(params)` → `Promise<School[]>`

Find schools near an address or coordinates.

```js
await client.schools.near({ address: '123 Main St, Austin, TX', radiusMiles: 2 });
await client.schools.near({ lat: 30.27, lng: -97.74, radiusMiles: 5, limit: 10 });
```

#### `.district(ncesId)` → `Promise<District>`

Get the district that a school belongs to.

```js
await client.schools.district('060001709098');
```

---

## Error handling

All methods throw typed errors:

```js
const {
  DistrictAPI,
  NotFoundError,
  AuthenticationError,
  RateLimitError,
  InvalidParamsError,
} = require('districtapi');

try {
  const district = await client.districts.fetch('9999999');
} catch (err) {
  if (err instanceof NotFoundError) {
    console.log('District not found');
  } else if (err instanceof AuthenticationError) {
    console.log('Invalid API key');
  } else if (err instanceof RateLimitError) {
    console.log('Rate limit exceeded — upgrade at districtapi.dev/pricing');
  } else if (err instanceof InvalidParamsError) {
    console.log('Bad request:', err.message);
  }
}
```

All error classes extend `DistrictAPIError` and expose:
- `err.statusCode` — HTTP status code
- `err.code` — API error code string (if available)

---

## Data

- **Source:** NCES Common Core of Data (CCD) 2024-25, NCES EDGE geocodes, Census TIGER boundaries, F-33 fiscal data
- **Coverage:** 19,630 districts · 102,178 schools · all 50 states
- **Updated:** Annually (December release)

---

## Links

- **Docs:** [districtapi.dev/docs](https://districtapi.dev/docs)
- **Dashboard:** [districtapi.dev/dashboard](https://districtapi.dev/dashboard)
- **npm:** [npmjs.com/package/districtapi](https://www.npmjs.com/package/districtapi)
- **Issues:** [github.com/districtapi/districtapi-node/issues](https://github.com/districtapi/districtapi-node/issues)

## License

MIT
