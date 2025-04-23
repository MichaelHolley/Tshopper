# Build stage
FROM node:22-alpine as build

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

# Production stage
FROM node:22-alpine

WORKDIR /app
COPY --from=build /app/.output /app

ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=6000

EXPOSE 6000

CMD ["node", "/app/server/index.mjs"]