# homelab

An infrastructure learning sandbox. The goal: practice the full self-hosting
loop — containerize an app, wire up a database, scrape metrics, visualize them,
and eventually push the whole thing onto a real server and then k3s.

**Phase 1 (this milestone):** a one-command Docker Compose stack — a sample web
app + Postgres + Prometheus + Grafana — with the app's metrics live in a Grafana
dashboard.

## Architecture

```
                              homelab (docker network)
  ┌──────────────────────────────────────────────────────────────────────┐
  │                                                                        │
  │    ┌─────────────┐         SQL          ┌──────────────┐               │
  │    │     app     │ ───────────────────▶ │   postgres   │               │
  │    │  Node/Express│ ◀─────────────────── │   :5432      │               │
  │    │   :3000     │                       └──────────────┘               │
  │    │             │                                                      │
  │    │  /healthz   │   scrape /metrics     ┌──────────────┐               │
  │    │  /readyz    │ ◀──────────────────── │  prometheus  │               │
  │    │  /metrics   │      every 15s        │   :9090      │               │
  │    └─────────────┘                       └──────┬───────┘               │
  │                                                 │ PromQL                │
  │                                                 ▼                       │
  │                                          ┌──────────────┐               │
  │                                          │   grafana    │               │
  │                                          │   :3000      │               │
  │                                          └──────────────┘               │
  └──────────────────────────────┬──────────────┬──────────────┬───────────┘
                                  │              │              │
              host ports:   app :3000     prom :9090     grafana :3001
```

- **app** — minimal Node/Express service. Exposes `/healthz` (liveness),
  `/readyz` (DB readiness), and `/metrics` (Prometheus format). Queries Postgres
  on `/` and reports DB reachability via the `app_db_up` metric.
- **postgres** — Postgres 16, data on a named volume.
- **prometheus** — scrapes the app every 15s (see `prometheus/prometheus.yml`).
- **grafana** — auto-provisioned Prometheus datasource + a starter dashboard
  (`grafana/dashboards/homelab-app.json`).

## Requirements

- Docker Engine + the Compose plugin (`docker compose version`).
  On Windows, use Docker Desktop with WSL integration enabled.
- `make` (optional — every target is just a `docker compose` command).

## Quick start

```sh
cp .env.example .env      # optional: tweak credentials
make up                   # build + start everything in the background
```

`make up` prints the URLs. Default credentials are `admin / admin` for Grafana.

| Service    | URL                   | Notes                                  |
| ---------- | --------------------- | -------------------------------------- |
| App        | http://localhost:3000 | `/`, `/healthz`, `/readyz`, `/metrics` |
| Prometheus | http://localhost:9090 | Status → Targets to confirm scraping   |
| Grafana    | http://localhost:3001 | login `admin` / `admin`                |

### Make targets

```
make up       Build and start the whole stack (detached)
make down     Stop and remove containers (keeps data volumes)
make logs     Tail logs from all services
make ps       Show service status
make restart  Restart all services
make clean    Stop AND delete volumes (DESTROYS postgres/grafana data)
make urls     Print the service URLs
make help     List targets
```

## Verify it works

1. **App is up:** `curl localhost:3000/healthz` → `{"status":"ok",...}`
2. **Metrics exposed:** `curl localhost:3000/metrics` → Prometheus text, including
   `http_requests_total`, `app_db_up`, `http_request_duration_seconds_bucket`.
3. **DB connected:** `curl localhost:3000/` → `"db":{"connected":true,...}`.
4. **Prometheus scraping:** open http://localhost:9090/targets — the `homelab-app`
   target should be **UP**.
5. **Grafana dashboard live:** open http://localhost:3001 → Dashboards → _Homelab_
   → **Homelab — App Overview**. Generate some traffic to see the graphs move:
   ```sh
   for i in $(seq 1 200); do curl -s localhost:3000/ >/dev/null; done
   ```

## Project layout

```
homelab/
├── app/                      # sample Node/Express app (Dockerfile, server.js)
├── prometheus/
│   └── prometheus.yml        # scrape config
├── grafana/
│   ├── provisioning/         # datasource + dashboard providers (auto-loaded)
│   └── dashboards/
│       └── homelab-app.json  # starter dashboard
├── k3s/                      # Phase 2 placeholder manifests
├── docker-compose.yml
├── Makefile
├── MILESTONES.md
└── .env.example
```

## Roadmap

See [MILESTONES.md](MILESTONES.md). Next up: move this onto a real VPS, then
port it to k3s using the drafts in [`k3s/`](k3s/).

## License

[MIT](LICENSE)
