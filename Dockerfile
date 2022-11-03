FROM node:14-alpine3.15 as app
RUN apk update && apk add --no-cache openssl python2 make g++

WORKDIR /base/app

COPY . .

RUN yarn install
RUN yarn build

RUN chown -R node:node /base/
USER node

ENV PORT 8080

ENTRYPOINT ["yarn", "start"]
