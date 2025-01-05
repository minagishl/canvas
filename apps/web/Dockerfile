FROM node:20

WORKDIR /app

COPY ../../ .

RUN yarn install

EXPOSE 5173

ENV HOST=0.0.0.0

CMD ["yarn", "dev", "--host"]
