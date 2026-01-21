SHELL := /bin/bash

.PHONY: help db-smoke db-audit supabase-up supabase-down

help:
	@echo "Targets:"
	@echo "  make db-smoke      - Supabase local + smoke + security audit"
	@echo "  make db-audit      - DB security baseline audit"
	@echo "  make supabase-up   - Starts Supabase local"
	@echo "  make supabase-down - Stops Supabase local"

supabase-up:
	@./scripts/supabase-up.sh

supabase-down:
	@./scripts/supabase-down.sh

db-smoke:
	@./scripts/db-smoke.sh

db-audit:
	@./scripts/db-security-audit.sh
