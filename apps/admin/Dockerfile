# ==========================================
# Stage 1: Dependencies (Monorepo-aware)
# ==========================================
FROM node:20-alpine AS deps

# Apply security updates (CVE fix: c-ares use-after-free)
RUN apk update && apk upgrade --no-cache

RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

WORKDIR /app

COPY pnpm-workspace.yaml ./
COPY pnpm-lock.yaml ./
COPY package.json ./
COPY turbo.json ./

# Copy shared packages
COPY packages/shared ./packages/shared

# Copy admin app
COPY apps/admin/package.json ./apps/admin/

# Install ALL dependencies (including root + workspace)
RUN pnpm install --frozen-lockfile

# ==========================================
# Stage 2: Builder
# ==========================================
FROM node:20-alpine AS builder

RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/admin/node_modules ./apps/admin/node_modules
COPY --from=deps /app/packages/shared ./packages/shared

COPY apps/admin ./apps/admin
COPY packages/shared/package.json ./packages/shared/package.json
COPY packages/shared/tsconfig.json ./packages/shared/tsconfig.json
COPY turbo.json ./
COPY package.json ./
COPY pnpm-workspace.yaml ./

# Build with Turbo
ENV VITE_TELEMETRY_DISABLED=1
RUN pnpm turbo run build --filter=@travelmatch/admin

# ==========================================
# Stage 3: Runner (Nginx)
# ==========================================
FROM nginx:alpine AS runner

# Copy custom nginx config
COPY apps/admin/nginx.conf /etc/nginx/conf.d/default.conf

# Copy build output
COPY --from=builder /app/apps/admin/dist /usr/share/nginx/html

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:80/health || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
