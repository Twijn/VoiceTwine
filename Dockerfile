FROM node:22-alpine

WORKDIR /app

# Enable pnpm via Corepack
RUN corepack enable && corepack prepare pnpm@10.10.0 --activate

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build TypeScript code
RUN pnpm run build

# Expose port if needed (for potential future web interface)
# EXPOSE 3000

# Command to run the application
ENTRYPOINT ["node", "dist/app.js"]
