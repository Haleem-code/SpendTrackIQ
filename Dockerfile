FROM oven/bun:1 AS base
WORKDIR /app

# Copy root package files
COPY package.json ./

# Copy the shared package and api app
COPY packages/shared ./packages/shared
COPY apps/api ./apps/api

# Install dependencies (Bun workspaces will automatically link @haleem/shared to apps/api)
RUN bun install

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3001

# Expose the port the app runs on
EXPOSE 3001

# Start the API from the root, targeting the api workspace
CMD ["bun", "run", "--cwd", "apps/api", "start"]
