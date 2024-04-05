# TODO:"Fix Bugs"

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
FROM node:14.21.0-alpine AS release
WORKDIR /usr/src/app
COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/package.json ./package.json
EXPOSE 3000
CMD [ "npm", "run", "start" ]