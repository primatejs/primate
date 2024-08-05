FROM oven/bun:1-alpine

WORKDIR /app

COPY ./packages/website .
COPY ./docs ./components/content

RUN bun i

CMD ["bun", "--bun", "x", "primate", "serve"]
