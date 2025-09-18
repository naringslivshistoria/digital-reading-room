FROM node:18.14.1-slim AS builder
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.6.1 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN pnpm install

ADD . .

ARG SEARCH_URL
ENV VITE_SEARCH_URL=${SEARCH_URL}

ARG COOKIE_DOMAIN
ENV VITE_COOKIE_DOMAIN=${COOKIE_DOMAIN}

RUN pnpm run build

FROM nginx:alpine AS runner
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
