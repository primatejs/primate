FROM node-alpine

WORKDIR /app

COPY ./packages/website .
COPY ./docs ./components/content

RUN npm i

CMD ["npx", "primate", "serve"]
