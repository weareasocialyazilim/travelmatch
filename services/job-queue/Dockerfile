FROM node:20-alpine AS base
RUN apk update && apk upgrade --no-cache
RUN npm install -g pnpm
WORKDIR /app

FROM base AS deps
# Copy workspace config
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json turbo.json tsconfig.json ./

# Copy packages that might be dependencies
COPY packages/shared ./packages/shared

# Copy the service code
COPY services/job-queue ./services/job-queue

# Install dependencies (from root)
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app ./

# Build the specific package
RUN pnpm turbo run build --filter=@lovendo/job-queue

FROM base AS runner
WORKDIR /app

# Copy necessary files for runtime
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-workspace.yaml ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/packages/shared/package.json ./packages/shared/
COPY --from=builder /app/services/job-queue/package.json ./services/job-queue/
COPY --from=builder /app/services/job-queue/dist ./services/job-queue/dist

WORKDIR /app/services/job-queue

ENV NODE_ENV production
EXPOSE 3002

CMD ["pnpm", "start"]
