FROM node:18 AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install --omit=dev

FROM node:18-alpine AS runner
WORKDIR /app

COPY . .
COPY --from=builder /app/node_modules ./node_modules

CMD ["npm", "run", "start"]
