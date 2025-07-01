# Use Node.js LTS version
FROM node:18-alpine AS base

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Create a stage for development
FROM base AS development
RUN npm ci
COPY . .
EXPOSE 8000
CMD ["npm", "run", "dev"]

# Create a stage for building
FROM base AS build
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine AS production

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Set working directory
WORKDIR /app

# Copy built application
COPY --from=build --chown=nextjs:nodejs /app/dist ./dist
COPY --from=build --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=build --chown=nextjs:nodejs /app/package*.json ./
COPY --from=build --chown=nextjs:nodejs /app/prisma ./prisma

# Create logs directory
RUN mkdir -p logs && chown nextjs:nodejs logs

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

# Start the application
CMD ["npm", "start"] 