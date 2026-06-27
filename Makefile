# Homelab — local stack controls
# Usage: make <target>   (run `make help` to list targets)

COMPOSE := docker compose

.DEFAULT_GOAL := help
.PHONY: help up down logs ps restart build pull clean urls

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-10s\033[0m %s\n", $$1, $$2}'

up: ## Build and start the whole stack in the background
	$(COMPOSE) up -d --build
	@$(MAKE) --no-print-directory urls

down: ## Stop and remove containers (keeps volumes/data)
	$(COMPOSE) down

logs: ## Tail logs from all services (Ctrl-C to stop)
	$(COMPOSE) logs -f

ps: ## Show service status
	$(COMPOSE) ps

restart: ## Restart all services
	$(COMPOSE) restart

build: ## Build the app image
	$(COMPOSE) build

pull: ## Pull the latest upstream images
	$(COMPOSE) pull

clean: ## Stop containers AND delete volumes (DESTROYS postgres/grafana data)
	$(COMPOSE) down -v

urls: ## Print the service URLs
	@echo ""
	@echo "  App         http://localhost:3000     ( / , /healthz , /metrics )"
	@echo "  Prometheus  http://localhost:9090     (Status > Targets to verify scrape)"
	@echo "  Grafana     http://localhost:3001     (login admin / admin)"
	@echo ""
