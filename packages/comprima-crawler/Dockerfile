FROM node:18.14.1 AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install --omit=dev

FROM node:18.14.1-slim AS runner
WORKDIR /app

COPY . .
COPY --from=builder /app/node_modules ./node_modules

CMD ["npm", "run", "start"]
