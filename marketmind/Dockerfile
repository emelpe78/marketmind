# syntax=docker/dockerfile:1

FROM node:24-bookworm-slim AS build

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:24-bookworm-slim AS production

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5667
ENV HOST=0.0.0.0
ENV MM_PORT=5667
ENV MM_DATABASE_PATH=/app/data/marketmind.db

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates \
  && rm -rf /var/lib/apt/lists/* \
  && mkdir -p /app/data

COPY --from=build /app/.output ./.output
COPY --from=build /app/server/database/schema.sql ./server/database/schema.sql

EXPOSE 5667

CMD ["node", ".output/server/index.mjs"]
