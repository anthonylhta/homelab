'use strict';

// Point the pool at a closed local port BEFORE requiring the app so DB calls
// fail fast (ECONNREFUSED) instead of hanging on DNS for the "postgres" host.
process.env.POSTGRES_HOST = '127.0.0.1';
process.env.POSTGRES_PORT = '5999';

const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { app, pool } = require('./server');

/** @type {import('http').Server} */
let server;
/** @type {string} */
let base;

before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, resolve);
  });
  const addr = server.address();
  const port = typeof addr === 'object' && addr ? addr.port : 0;
  base = `http://127.0.0.1:${port}`;
});

after(async () => {
  await new Promise((resolve) => server.close(() => resolve(undefined)));
  await pool.end();
});

test('GET /healthz returns 200 and status ok', async () => {
  const res = await fetch(`${base}/healthz`);
  assert.equal(res.status, 200);
  const body = /** @type {any} */ (await res.json());
  assert.equal(body.status, 'ok');
  assert.equal(typeof body.uptime_seconds, 'number');
});

test('GET /metrics exposes app metrics in Prometheus format', async () => {
  // Generate one request so the counter is non-zero.
  await fetch(`${base}/`);
  const res = await fetch(`${base}/metrics`);
  assert.equal(res.status, 200);
  assert.match(res.headers.get('content-type') || '', /text\/plain/);
  const text = await res.text();
  assert.match(text, /http_requests_total/);
  assert.match(text, /http_request_duration_seconds_bucket/);
  assert.match(text, /app_db_up/);
  assert.match(text, /process_resident_memory_bytes/);
});

test('GET /readyz returns 503 when the database is unreachable', async () => {
  const res = await fetch(`${base}/readyz`);
  assert.equal(res.status, 503);
  const body = /** @type {any} */ (await res.json());
  assert.equal(body.status, 'not-ready');
  assert.equal(body.db, 'down');
});
