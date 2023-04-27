FROM node:18.14.1-slim AS builder
WORKDIR /app

ADD package*.json .
RUN npm ci

ADD . .

ARG SEARCH_URL
ENV VITE_SEARCH_URL=${SEARCH_URL}

ARG COOKIE_DOMAIN
ENV VITE_COOKIE_DOMAIN=${COOKIE_DOMAIN}

RUN npm run build

FROM nginx:alpine AS runner
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
