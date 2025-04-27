FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build TypeScript code
RUN npm run build

# Expose port if needed (for potential future web interface)
# EXPOSE 3000

# Command to run the application
CMD ["node", "dist/app.js"]
