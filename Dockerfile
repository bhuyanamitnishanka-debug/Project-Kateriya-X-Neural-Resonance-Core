# syntax=docker/dockerfile:1
# =====================================================================
# PROJECT KATERIYA-X: NEURAL RESONANCE CORE
# Production Multi-Stage Dockerfile
# =====================================================================

# Stage 1: Build & Safety Interlock Verification
FROM node:20-alpine AS builder

WORKDIR /app

# Install system dependencies if required
RUN apk add --no-cache libc6-compat

# Install package dependencies
COPY package.json ./
RUN npm install

# Copy application sources
COPY . .

# Run safety interlock test suite before compilation
RUN npm test

# Compile client SPA and server bundle
RUN npm run build

# Stage 2: Minimal Production Runtime
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy runtime files from builder
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/index.html ./index.html

# Expose standard port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3000/api/health || exit 1

# Start Kateriya-X production server
CMD ["node", "dist/server.js"]
