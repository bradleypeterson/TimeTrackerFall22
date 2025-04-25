
FROM node:22-alpine

WORKDIR /usr/src/app

COPY package.json .
COPY package-lock.json .

RUN npm install @angular/cli

COPY . .

EXPOSE 9001

CMD node_modules/.bin/ng serve --watch --host 0.0.0.0 --port 9001

