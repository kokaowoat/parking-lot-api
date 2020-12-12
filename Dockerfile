FROM node:12-alpine

RUN npm install pm2 -g

WORKDIR /usr/src/app

ADD . /usr/src/app

RUN npm install --production

EXPOSE 3000

CMD ["pm2-runtime", "server/server.js"]

