FROM oven/bun:latest AS base
WORKDIR /app

COPY . .

RUN bun install

# ---- Build only runner (optional if TS build needed) ----
# RUN bun run build --filter=runner

# ---- Run runner ----
WORKDIR /app/apps/runner

EXPOSE 8000

CMD ["bun", "run", "index.ts"]