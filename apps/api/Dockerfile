FROM node:20

WORKDIR /app

COPY ../../ .

RUN yarn install

EXPOSE 8787

ENV HOST=0.0.0.0

CMD ["yarn", "dev"]
