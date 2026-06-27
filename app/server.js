'use strict';

const express = require('express');
const client = require('prom-client');
const { Pool } = require('pg');

const PORT = parseInt(process.env.PORT || '3000', 10);

// ---------------------------------------------------------------------------
// Postgres pool. The app intentionally stays UP even when the database is
// unreachable — DB health is surfaced via /metrics (app_db_up) and /readyz,
// not by crashing the process.
// ---------------------------------------------------------------------------
const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'postgres',
  port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
  user: process.env.POSTGRES_USER || 'homelab',
  password: process.env.POSTGRES_PASSWORD || 'homelab',
  database: process.env.POSTGRES_DB || 'homelab',
  max: 5,
  connectionTimeoutMillis: 2000,
});

// An idle backend client erroring out should not take down the server.
pool.on('error', (err) => console.error('[pg] idle client error:', err.message));

// ---------------------------------------------------------------------------
// Prometheus metrics
// ---------------------------------------------------------------------------
const register = new client.Registry();
register.setDefaultLabels({ app: 'homelab-app' });
client.collectDefaultMetrics({ register });

const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status'],
  registers: [register],
});

const httpRequestDurationSeconds = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
  registers: [register],
});

const dbUp = new client.Gauge({
  name: 'app_db_up',
  help: 'Whether the app can reach Postgres (1 = up, 0 = down)',
  registers: [register],
});

const dbQueriesTotal = new client.Counter({
  name: 'app_db_queries_total',
  help: 'Total database queries issued by the app',
  labelNames: ['status'],
  registers: [register],
});

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------
const app = express();
app.disable('x-powered-by');

// Per-request metrics middleware.
app.use((req, res, next) => {
  const end = httpRequestDurationSeconds.startTimer();
  res.on('finish', () => {
    // Use the matched route template (e.g. "/") to keep label cardinality low.
    const route = req.route ? req.route.path : req.path;
    const labels = { method: req.method, route, status: String(res.statusCode) };
    httpRequestsTotal.inc(labels);
    end(labels);
  });
  next();
});

async function queryDb(sql) {
  try {
    const result = await pool.query(sql);
    dbQueriesTotal.inc({ status: 'ok' });
    dbUp.set(1);
    return { ok: true, result };
  } catch (err) {
    dbQueriesTotal.inc({ status: 'error' });
    dbUp.set(0);
    return { ok: false, error: err.message };
  }
}

app.get('/', async (req, res) => {
  const db = await queryDb('SELECT now() AS now, version() AS version');
  res.json({
    service: 'homelab-app',
    message: 'Hello from the homelab sample app',
    db: db.ok
      ? { connected: true, now: db.result.rows[0].now, version: db.result.rows[0].version }
      : { connected: false, error: db.error },
  });
});

// Liveness: process is up and serving. DB problems do NOT fail liveness.
app.get('/healthz', (req, res) => {
  res.json({ status: 'ok', uptime_seconds: Math.round(process.uptime()) });
});

// Readiness: fail when the DB dependency is unreachable.
app.get('/readyz', async (req, res) => {
  const db = await queryDb('SELECT 1');
  if (db.ok) return res.json({ status: 'ready', db: 'up' });
  return res.status(503).json({ status: 'not-ready', db: 'down', error: db.error });
});

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// Background probe so app_db_up reflects reality even with no traffic.
const probe = setInterval(() => { queryDb('SELECT 1').catch(() => {}); }, 15000);
queryDb('SELECT 1').catch(() => {});

const server = app.listen(PORT, () => {
  console.log(`homelab-app listening on :${PORT}`);
});

// ---------------------------------------------------------------------------
// Graceful shutdown so `docker compose down` / k8s SIGTERM is clean.
// ---------------------------------------------------------------------------
function shutdown(signal) {
  console.log(`[${signal}] shutting down...`);
  clearInterval(probe);
  server.close(() => {
    pool.end().finally(() => process.exit(0));
  });
  setTimeout(() => process.exit(1), 10000).unref();
}
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
