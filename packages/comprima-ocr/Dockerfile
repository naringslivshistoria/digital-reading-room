FROM node:18.14.1-alpine AS builder
WORKDIR /app

RUN apk add --update --no-cache \
  build-base \
  pango-dev

COPY package.json package-lock.json ./
RUN npm install --omit=dev

FROM node:18.14.1-alpine AS runner
WORKDIR /app

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

CMD ["npm", "run", "start"]
