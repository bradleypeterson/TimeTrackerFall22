FROM node:16

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package.json .
COPY package-lock.json .

RUN npm install

# If you are building your code for production
# RUN npm ci --only=production

# Bundle NodeAPI Folder and Database Folder
COPY . .
#COPY Database/. ./Database/

EXPOSE 8080
# Braxton Changed from "node" to "./node_modules/.bin/nodemon" to allow nodemon to run so you can live restart the backend when changing files
# We have it as below instead of "nodemon" because of the issue here https://stackoverflow.com/questions/67583633/error-cannot-find-module-usr-src-app-nodemon-while-using-docker-compose
CMD [ "node", "server.js" ]