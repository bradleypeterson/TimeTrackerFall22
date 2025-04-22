FROM node:22-alpine

WORKDIR /usr/src/app

COPY package.json .
COPY package-lock.json .

RUN npm install @angular/cli

COPY . .

RUN set -ex && apk --no-cache add sudo

EXPOSE 9001

CMD sudo node_modules/.bin/ng serve --watch --host 0.0.0.0 --port 9001