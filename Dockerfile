# ── Stage 1: Build Frontend Assets ───────────────────────────
FROM node:20-alpine AS client-builder
WORKDIR /app/client

COPY client/package*.json ./
RUN npm ci

COPY client/ ./
RUN npm run build

# ── Stage 2: Production Server Runner ──────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

# Set Production Environment
ENV NODE_ENV=production
ENV PORT=8080

# Copy Server Package files and install dependencies
COPY server/package*.json ./server/
WORKDIR /app/server
RUN npm ci --omit=dev

# Copy Server Source Code
COPY server/ ./

# Copy Built Client Assets from Stage 1 into client/dist
COPY --from=client-builder /app/client/dist /app/client/dist

EXPOSE 8080

CMD ["npm", "start"]
