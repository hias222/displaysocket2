FROM node:16
# Create app directory
WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .
# COPY --chown=node:node . .
EXPOSE 8080
CMD [ "node", "app.js" ]
