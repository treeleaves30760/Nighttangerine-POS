# Use Ubuntu 24.04 as base image
FROM ubuntu:24.04

# Set non-interactive mode for apt
ARG DEBIAN_FRONTEND=noninteractive

# Install Node.js 22, curl, and other essential tools
RUN apt-get update && apt-get install -y \
    curl \
    gnupg \
    lsb-release \
    ca-certificates \
    && curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get install -y nodejs \
    && npm install -g pnpm@latest \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Create app user with home directory
RUN groupadd -r app && useradd -r -g app -m app

# Set working directory
WORKDIR /app

# Copy package files and install as root first (to avoid permission issues)
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN pnpm run build

# Change ownership of everything to app user
RUN chown -R app:app /app

# Switch to app user for runtime security
USER app

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Start the application
CMD ["pnpm", "start"]