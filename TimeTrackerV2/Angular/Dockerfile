FROM node:16-alpine3.15

WORKDIR /usr/src/app

COPY package.json .
COPY package-lock.json .

RUN npm install -g@angular/cli

COPY . .

RUN set -ex && apk --no-cache add sudo

EXPOSE 4200

CMD sudo node_modules/.bin/ng serve --watch --host 0.0.0.0 --disable-host-check