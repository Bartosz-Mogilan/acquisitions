# Base image with Node.js
FROM node:18-alpine AS base

# Install runtime tools
RUN apk add --no-cache bash postgresql-client ca-certificates

# Set working Directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci --silent

# Copy source code
COPY . .

# Make scripts executable 
RUN chmod +x ./scripts/*.sh || true

# Create non-root user 
RUN addgroup -g 1001 -S nodejs && adduser -S -G nodejs -u 1001 nodejs
RUN chown -R nodejs:nodejs /app

# Expose the port
EXPOSE 3000

# Health Check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', res => process.exit(res.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

# Development stage
FROM base AS development
USER nodejs
ENV NODE_ENV=development
CMD [ "npm", "run", "dev" ]

# Production stage
FROM node:18-alpine AS production
WORKDIR /app

# Install runtime tools 
RUN apk add --no-cache bash postgresql-client ca-certificates

# Install dependencies and copy packages
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev --silent

# Copy app files from base
COPY --from=base /app /app

# Ensure logs
RUN mkdir -p /app/logs && chown -R nodejs:nodejs /app/logs

# Running as non-root user
USER nodejs
ENV NODE_ENV=production

EXPOSE 3000
CMD ["npm", "start"]
