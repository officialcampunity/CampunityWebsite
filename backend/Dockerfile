FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
RUN addgroup --system --gid 1001 nestjs && \
    adduser --system --uid 1001 -G nestjs nestjs
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
RUN mkdir -p /app/uploads/avatars && chown -R nestjs:nestjs /app/uploads
USER nestjs
EXPOSE 4000
CMD ["node", "dist/main"]
