FROM node:alpine

WORKDIR /app

COPY . .

EXPOSE 3000

RUN apk update && apk upgrade &&\
    apk add --no-cache unzip zip wget curl  &&\
    chmod +x app.js &&\
    npm install

CMD ["npm", "start"]
