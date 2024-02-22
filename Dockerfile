# ---- Base Node ----
FROM node:14.20.1-alpine AS base
WORKDIR /usr/src/app
COPY package.json pnpm-lock.yaml ./

# ---- Dependencies ----
FROM base AS dependencies
RUN npm install -g pnpm`
RUN pnpm install

# ---- Copy Files/Build ----
FROM dependencies AS build
COPY . .
RUN pnpm run build

# ---- Release ----
FROM node:14.20.1-alpine AS release
WORKDIR /usr/src/app
COPY --from=build /usr/src/app/dist ./dist
COPY --from=dependencies /usr/src/app/node_modules ./node_modules
EXPOSE 3000
CMD [ "node", "dist/index.js" ]