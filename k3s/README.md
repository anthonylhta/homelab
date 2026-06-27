# k3s manifests (Phase 2 — drafts)

These are **placeholders** for porting the compose stack to k3s. They are not
applied or tested yet — they exist so Phase 2 has a starting point.

| File              | Purpose                                           |
| ----------------- | ------------------------------------------------- |
| `namespace.yaml`  | Dedicated `homelab` namespace                     |
| `deployment.yaml` | Runs the sample app (mirrors the compose `app`)   |
| `service.yaml`    | ClusterIP + Prometheus scrape annotations         |
| `ingress.yaml`    | Traefik ingress (k3s default) — needs a real host |

## Before applying (TODO)

1. Build and push the app image to a registry (GHCR), then set `image:` in `deployment.yaml`.
2. Create the DB Secret: `kubectl -n homelab create secret generic homelab-db --from-literal=password=...`
3. Decide how Postgres runs: in-cluster StatefulSet (add a manifest) or a managed DB.
4. Add Prometheus + Grafana (kube-prometheus-stack via Helm is the usual path).
5. Set a real `host:` in `ingress.yaml` and enable cert-manager for TLS.

## Sketch (once filled in)

```sh
kubectl apply -f namespace.yaml
kubectl apply -f deployment.yaml -f service.yaml -f ingress.yaml
kubectl -n homelab get pods,svc,ingress
```
