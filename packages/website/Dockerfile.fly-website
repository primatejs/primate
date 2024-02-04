FROM denoland/deno:alpine

COPY ./packages/website /app/website
COPY ./docs /app/website/components/content

WORKDIR /app/website

CMD ["deno", "run", "--allow-all", "npm:primate", "serve"]
