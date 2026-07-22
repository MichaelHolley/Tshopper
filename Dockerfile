FROM node:24-alpine AS build

RUN corepack enable
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm run build

FROM node:24-alpine AS runtime

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0
# override adapter-node default of 512K
ENV BODY_SIZE_LIMIT=8M

# adapter-node bundles every server dependency into build/, so no node_modules here.
COPY --from=build /app/build ./build
# Applied on boot by the init hook.
COPY --from=build /app/drizzle ./drizzle

USER node
EXPOSE 3000
CMD ["node", "build"]
