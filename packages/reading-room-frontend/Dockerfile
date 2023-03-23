FROM node:18.14.1-slim AS builder
WORKDIR /app

ADD package*.json .
RUN npm ci

ADD . .

ARG COMPRIMA_ADAPTER_URL
ENV VITE_COMPRIMA_ADAPTER_URL=${COMPRIMA_ADAPTER_URL}

ARG SEARCH_URL
ENV VITE_SEARCH_URL=${SEARCH_URL}

RUN npm run build

FROM nginx:alpine AS runner
COPY --from=builder /app/dist /usr/share/nginx/html
