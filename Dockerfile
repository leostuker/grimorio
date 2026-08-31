# Multi-stage build for Grimório de Magias (Full-Stack Express + React + PostgreSQL 16)
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source files
COPY . .

# Build Vite frontend and Express bundled backend
RUN npm run build

# Production Runner
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# Install production dependencies
COPY package*.json ./
RUN npm install --only=production

# Copy compiled artifacts from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server
COPY --from=builder /app/src/types.ts ./src/types.ts

EXPOSE 3000

CMD ["node", "dist/server.cjs"]
