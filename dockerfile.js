# build environment
FROM node:19.6.0-alpine as build
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY package.json /app/package.json
RUN npm install --silent
COPY . /app
RUN npm run build
FROM httpd:alpine
RUN apk add openssl
COPY --from=build /app/dist /usr/local/apache2/htdocs
COPY httpd.conf /usr/local/apache2/conf
RUN openssl req -new -x509 -subj "/C=BE/ST=Brabant-wallon/L=Louvain-La-Neuve/O=Ephec/OU=IT/CN=172.31.36.83" -days 365 -nodes -out /usr/local/apache2/conf/server.crt -keyout /usr/local/apache2/conf/server.key
CMD httpd-foreground