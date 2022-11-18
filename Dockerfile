FROM node:14-alpine3.15 as app
RUN apk update && apk add --no-cache openssl python2 make g++

WORKDIR /base/app

COPY . .

# Extracting env variables to a .env file…
RUN set > "/base/app/.env.production"

# Copying the generated .env file to all different packages…
RUN find /base/app/packages -type d -maxdepth 1 -exec cp .env.production {} \;

ENV VUE_APP_TEST "test-tintin-42"
ENV VUE_APP_APP_ID $VUE_APP_APP_ID

ARG VUE_APP_METAPARAMS_BACKEND_ENDPOINT
ENV VUE_APP_METAPARAMS_BACKEND_ENDPOINT $VUE_APP_METAPARAMS_BACKEND_ENDPOINT

ENV VUE_APP_PROXY_ENABLED $VUE_APP_PROXY_ENABLED
ENV VUE_APP_SEARCH_ONLY_API_KEY $VUE_APP_SEARCH_ONLY_API_KEY
ENV VUE_APP_TOOLS_INTERNAL_ENDPOINT $VUE_APP_TOOLS_INTERNAL_ENDPOINT

# Installing dependencies + building global package…
RUN yarn install
RUN yarn build

RUN chown -R node:node /base/
USER node

ENV PORT 8080

ENTRYPOINT ["yarn", "start"]
