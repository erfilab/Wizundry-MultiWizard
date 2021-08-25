FROM node:alpine

WORKDIR /app

COPY ./package.json .
COPY ./yarn.lock .

RUN yarn

COPY . .
EXPOSE 3001

CMD ["node", "yjs-server.js"]
