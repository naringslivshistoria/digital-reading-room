FROM node:18.14.1 AS builder
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
# Install pnpm
RUN corepack enable && corepack prepare pnpm@10.6.1 --activate
RUN pnpm install

FROM node:18.14.1-alpine AS runner

# Install pnpm
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@10.17.0 --activate

COPY . .
COPY --from=builder /app/node_modules ./node_modules

CMD ["pnpm", "start"]
