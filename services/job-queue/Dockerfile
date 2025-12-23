# Use Node.js 20 Alpine for smaller image size
FROM node:20-alpine AS base

# Apply security updates (CVE fix: c-ares use-after-free)
RUN apk update && apk upgrade --no-cache

# Install pnpm globally
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build TypeScript
RUN pnpm build

# Production stage
FROM node:20-alpine AS production

RUN npm install -g pnpm

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install production dependencies only
RUN pnpm install --prod --frozen-lockfile

# Copy built code from base stage
COPY --from=base /app/dist ./dist

# Expose port
EXPOSE 3002

# Default command (can be overridden)
CMD ["pnpm", "start"]
