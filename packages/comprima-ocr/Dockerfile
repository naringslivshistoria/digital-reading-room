FROM node:18.14.1-alpine AS builder
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@10.17.0 --activate

RUN apk add --update --no-cache \
  build-base \
  pango-dev

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install

FROM node:18.14.1-alpine AS runner
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@10.17.0 --activate

# TODO: Slim down deps.
RUN apk add --update --no-cache \
  cairo-dev \
  jpeg-dev \
  libjpeg \
  pango-dev \
  giflib-dev \
  libtool

COPY . .
COPY --from=builder /app/node_modules ./node_modules

CMD ["pnpm", "start"]
