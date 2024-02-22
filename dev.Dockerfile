FROM node:20.11.1-alpine AS base
WORKDIR /usr/src/app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install

FROM base AS run
COPY . .
EXPOSE 3000
CMD [ "pnpm", "dev" ]