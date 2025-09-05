FROM node:lts-alpine

WORKDIR /app

COPY . ./
RUN npm install

COPY .env ./

COPY . .

EXPOSE 4000

CMD ["node", "main.js"]

VOLUME [ "/data" ]