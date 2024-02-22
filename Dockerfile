# ---- Base Node ----
FROM node:20.11.1-alpine AS base
WORKDIR /usr/src/app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm

# ---- Build ----
FROM base AS build
COPY . .
RUN pnpm install && pnpm run build

# ---- Release ----
FROM node:14.20.1-alpine AS release
WORKDIR /usr/src/app
COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/node_modules ./node_modules
EXPOSE 3000
CMD [ "node", "dist/index.js" ]