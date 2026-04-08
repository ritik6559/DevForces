FROM oven/bun:latest

WORKDIR /app

COPY package*.json ./

RUN bun install

COPY . . 

RUN bun run build 

EXPOSE 8000

CMD [ "bun", "run", "dist/index.js" ]