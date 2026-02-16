# ============================================
# Backend Dockerfile - Town of Salem
# ============================================
FROM node:22-alpine AS base

WORKDIR /app

# Install dependencies
COPY package.json ./
COPY prisma ./prisma/
RUN npm install --omit=dev

# Generate Prisma Client
RUN npx prisma generate

# Copy source code
COPY src ./src/

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/health || exit 1

# Start server
CMD ["sh", "-c", "npx prisma migrate deploy && npx prisma db seed && node src/index.js"]
