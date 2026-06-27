# Milestones

Tracking the journey from a local compose stack to self-hosted apps on k3s.

## Phase 1 — Local observability stack
- [ ] `compose up` — one command brings up app + postgres + prometheus + grafana
- [ ] metrics scraped — Prometheus scrapes the app's `/metrics` endpoint
- [ ] grafana dashboard live — provisioned datasource + starter dashboard render app metrics
- [ ] postgres connected — app talks to Postgres; `app_db_up` reports the connection
- [x] k3s manifests drafted — placeholder Deployment/Service/Ingress in `/k3s`
- [ ] deploy to a VPS — run the stack on a real server, reachable over the internet

> The first four boxes need a machine with Docker. The code + configs are built
> and validated; tick each box after running `make up` and walking through the
> README "Verify it works" checklist. The `/k3s` files are drafts for Phase 2.

## Phase 2 — Move to a real server / k3s (next)
- [ ] Provision a VPS (Hetzner / DigitalOcean / Fly machine) with Docker
- [ ] Reverse proxy + TLS (Caddy or Traefik) in front of the stack
- [ ] Secrets out of `.env` and into a proper secret store
- [ ] Persistent, backed-up Postgres volume
- [ ] Install k3s; port the compose services to the `/k3s` manifests
- [ ] Ingress + cert-manager for real DNS + HTTPS
- [ ] CI to build/push the app image on each commit
