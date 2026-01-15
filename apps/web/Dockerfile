# ==========================================
# Stage 1: Dependencies (Monorepo-aware)
# ==========================================
FROM node:20-alpine AS deps

# Apply security updates (CVE fix: c-ares use-after-free)
RUN apk update && apk upgrade --no-cache

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

WORKDIR /app

# Copy workspace config (monorepo root)
COPY pnpm-workspace.yaml ./
COPY pnpm-lock.yaml ./
COPY package.json ./
COPY turbo.json ./

# Copy shared packages first (for layer caching)
COPY packages/shared ./packages/shared

# Copy web app
COPY apps/web/package.json ./apps/web/

# Install ALL dependencies (including root + workspace)
RUN pnpm install --frozen-lockfile

# ==========================================
# Stage 2: Builder
# ==========================================
FROM node:20-alpine AS builder

RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

WORKDIR /app

# Copy dependencies from previous stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules
COPY --from=deps /app/packages/shared ./packages/shared

# Copy source code
COPY apps/web ./apps/web
COPY packages/shared/package.json ./packages/shared/package.json
COPY packages/shared/tsconfig.json ./packages/shared/tsconfig.json
COPY turbo.json ./
COPY package.json ./
COPY pnpm-workspace.yaml ./

# Build with Turbo
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm turbo run build --filter=@lovendo/web

# ==========================================
# Stage 3: Runner (Production)
# ==========================================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy public assets
COPY --from=builder /app/apps/web/public ./apps/web/public

# Copy production build
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "apps/web/server.js"]
