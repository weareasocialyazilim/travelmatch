# ==========================================
# Stage 1: Dependencies (Monorepo-aware)
# ==========================================
FROM node:22-alpine AS deps

# Apply security updates (CVE fix: c-ares use-after-free)
RUN apk update && apk upgrade --no-cache

RUN corepack enable && corepack prepare pnpm@10.28.0 --activate

WORKDIR /app

COPY pnpm-workspace.yaml ./
COPY pnpm-lock.yaml ./
COPY package.json ./
COPY turbo.json ./

# Copy shared packages
COPY packages/shared ./packages/shared
COPY packages/design-system ./packages/design-system

# Copy admin app
COPY apps/admin/package.json ./apps/admin/

# Install ALL dependencies (including root + workspace)
RUN pnpm install --frozen-lockfile

# ==========================================
# Stage 2: Builder
# ==========================================
FROM node:22-alpine AS builder

RUN corepack enable && corepack prepare pnpm@10.28.0 --activate

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/admin/node_modules ./apps/admin/node_modules
COPY --from=deps /app/packages ./packages

COPY apps/admin ./apps/admin
COPY turbo.json ./
COPY package.json ./
COPY pnpm-workspace.yaml ./
COPY pnpm-lock.yaml ./
COPY tsconfig.json ./

# Build with Turbo
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm turbo run build --filter=@lovendo/admin

# ==========================================
# Stage 3: Runner (Node.js for Next.js)
# ==========================================
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Copy Next.js standalone output
COPY --from=builder --chown=nextjs:nodejs /app/apps/admin/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/admin/.next/static ./.next/static

USER nextjs

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3001/api/health || exit 1

EXPOSE 3001

ENV PORT=3001

CMD ["node", "server.js"]
