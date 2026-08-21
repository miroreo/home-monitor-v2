# ---- Build stage ----
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---- Runtime stage ----
# The SvelteKit build output (adapter-node) is fully self-contained — no
# node_modules needed at runtime — so the runtime image only needs Node itself.
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

COPY --from=build /app/build ./build

EXPOSE 3000
CMD ["node", "build/index.js"]
