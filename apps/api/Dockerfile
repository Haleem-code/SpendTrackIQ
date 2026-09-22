FROM oven/bun:1 as base
WORKDIR /usr/src/app

COPY package.json bun.lock ./

# Copy packages and API source
COPY packages/shared ./packages/shared
COPY apps/api ./apps/api

# Install dependencies for the workspace
RUN bun install --frozen-lockfile

# Expose the API port
EXPOSE 3001
ENV PORT=3001
ENV NODE_ENV=production

# Start the API
CMD ["bun", "run", "apps/api/src/index.ts"]
