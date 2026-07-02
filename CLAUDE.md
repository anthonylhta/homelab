# CLAUDE.md

## What this is

`homelab` is an infrastructure learning sandbox. It runs a one-command Docker
Compose observability stack — a minimal Node/Express sample app instrumented
with Prometheus metrics, backed by Postgres, scraped by Prometheus, and
visualized in a provisioned Grafana dashboard. The goal is to practice the full
self-hosting loop and grow it toward running on a real VPS and then k3s (see
`MILESTONES.md`).

## Stack

- **App:** Node 20 + Express, plain JavaScript with JSDoc types (no build step;
  `tsc --checkJs` is the type gate). Metrics via `prom-client`, Postgres via `pg`.
- **Infra:** Docker Compose — `app`, `postgres` (16), `prometheus`, `grafana`.
- **Tooling:** ESLint + Prettier, `node:test` for tests, `tsc` for type-checking.
- **CI:** GitHub Actions (`.github/workflows/ci.yml`).

## Commands

Run from the repo root (npm workspaces; the app lives in `app/`).

| Task        | Command                                                |
| ----------- | ------------------------------------------------------ |
| Install     | `npm ci`                                               |
| Dev (app)   | `npm run dev` (Node `--watch`) — needs a local DB      |
| Dev (stack) | `make up` → app :3000, Prometheus :9090, Grafana :3001 |
| Build image | `npm run build` (`docker compose build`)               |
| Test        | `npm test` (`node --test app/`)                        |
| Lint        | `npm run lint` (ESLint + `prettier --check`)           |
| Format      | `npm run format` (`prettier --write`)                  |
| Type-check  | `npm run typecheck` (`tsc --noEmit`)                   |
| All gates   | `npm run check` (typecheck + lint + test)              |

Stack controls: `make up` / `make down` / `make logs` / `make ps` / `make clean`.

## Repository rules

- **Commit voice:** first person, plain capitalized sentences. **One logical
  change per commit.** Never narrate the process or who found what.
  **No AI/Claude attribution anywhere** in commits or PR bodies — no
  `Co-Authored-By`, no "Generated with…".
- **`main` is branch-protected.** Every change goes on a `<type>/<slug>` branch
  (`feat/`, `fix/`, `refactor/`, `chore/`) → PR → green CI → merge.
  **Never push to `main`.**
- **Never merge a PR.** The maintainer merges on GitHub. Stop at "PR open, green
  CI, tested, ready for review." Merge permission is granted per-PR and is never
  assumed to carry across features.
- **Don't reference local notes or ADR numbers** in commits or PR bodies. `notes/`
  is gitignored, so such references would resolve to nothing in the public
  history.

## Guardrails

- Only touch files inside this project's tree.
- Confirm before anything hard to reverse or outward-facing: deploys,
  `git push --force`, deleting/overwriting files you didn't create, or sending
  data to external services.
- **Read the real docs first.** Before writing code against a fast-moving
  dependency, read its _installed_ docs/changelog (e.g. in `node_modules`) — the
  current API may differ from training data. Heed deprecation notices.

## gstack (global skill suite)

gstack is installed machine-globally (`~/.claude/skills/gstack`, commands prefixed
`/gstack-*`) — never vendored into this repo. Proactively suggest the right one when
the task fits — don't wait to be asked:

- **Use here:** `/gstack-investigate` (systematic root-cause debugging across the
  compose stack), `/gstack-diagram` (compose/network/scrape-path architecture
  diagrams), `/gstack-careful` + `/gstack-freeze` (safety rails around destructive
  `docker`/`make` commands), `/gstack-qa` (drive the sample app and Grafana on
  localhost when the stack is up).
- **Never here:** `/gstack-ship` and `/gstack-land-and-deploy` — they push, open PRs
  and merge on their own terms; the branch → PR → green CI flow above owns shipping
  and merging stays manual. Keep gstack checkpoint auto-commits off; commits follow
  the commit voice above.

## Layout

```
app/        Node/Express sample app (server.js, server.test.js, Dockerfile)
prometheus/ scrape config
grafana/    provisioned datasource + starter dashboard
k3s/        Phase 2 placeholder manifests
notes/      local decision notes (gitignored — never referenced in history)
.github/    CI workflow
.claude/    slash commands + dev hooks
```
