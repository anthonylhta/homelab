# Milestones

Tracking the journey from a local compose stack to self-hosted apps on k3s.

## Phase 1 — Local observability stack
- [x] `compose up` — one command brings up app + postgres + prometheus + grafana
- [x] metrics scraped — Prometheus scrapes the app's `/metrics` endpoint
- [x] grafana dashboard live — provisioned datasource + starter dashboard render app metrics
- [x] postgres connected — app talks to Postgres; `app_db_up` reports the connection
- [x] k3s manifests drafted — placeholder Deployment/Service/Ingress in `/k3s`
- [ ] deploy to a VPS — run the stack on a real server, reachable over the internet

> Phase 1 items are marked done once you've run `make up` locally and confirmed
> the dashboard shows live data (see README "Verify it works"). The manifests in
> `/k3s` are drafts to be filled in during Phase 2.

## Phase 2 — Move to a real server / k3s (next)
- [ ] Provision a VPS (Hetzner / DigitalOcean / Fly machine) with Docker
- [ ] Reverse proxy + TLS (Caddy or Traefik) in front of the stack
- [ ] Secrets out of `.env` and into a proper secret store
- [ ] Persistent, backed-up Postgres volume
- [ ] Install k3s; port the compose services to the `/k3s` manifests
- [ ] Ingress + cert-manager for real DNS + HTTPS
- [ ] CI to build/push the app image on each commit
