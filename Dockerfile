# Stage 1: Builder
# Install dependencies and build the application
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files and install dependencies
COPY package.json ./
COPY package-lock.json ./
RUN npm install --frozen-lockfile

# Copy the rest of the application source code
COPY . .

# Build the Next.js application
RUN npm run build

# Stage 2: Runner
# Create a small production-ready image
FROM node:20-alpine AS runner
WORKDIR /app

# Set environment variable for production
ENV NODE_ENV=production
# The app will run on port 3000 by default. If you want to change it, you can set the PORT environment variable.
# ENV PORT=3000

# Copy the standalone output from the builder stage
COPY --from=builder /app/.next/standalone ./
# Copy the static assets from the builder stage
COPY --from=builder /app/.next/static ./.next/static
# Copy the public directory
COPY --from=builder /app/public ./public

# Expose the port the app runs on
EXPOSE 3000

# Command to run the application
CMD ["node", "server.js"]
