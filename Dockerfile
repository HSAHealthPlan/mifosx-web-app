################################################
################ STAGE 1: Build ################
# We label our stage as 'builder'
FROM node:9-alpine as builder

COPY package.json package-lock.json ./

RUN npm set progress=false && npm config set depth 0 && npm cache clean --force

## Storing node modules on a separate layer will prevent unnecessary npm installs at each build
RUN npm i && mkdir /ng-app && cp -R ./node_modules ./ng-app

WORKDIR /ng-app

COPY . .

## Build the angular app in production mode and store the artifacts in dist folder
RUN $(npm bin)/ng build --prod

################################################
################ STAGE 2: Setup ################
FROM nginx:alpine

## Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*

## From 'builder' stage copy over the artifacts in dist folder to default nginx public folder
COPY --from=builder /ng-app/dist/web-app /usr/share/nginx/html

## Copy our default Nginx config
COPY ./default.conf /etc/nginx/nginx.conf

## Copy our default Tomcat config
#COPY ./tomcat-basic.conf /etc/nginx/conf.d/

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]

# Command to build: docker build -t mifosx:latest .
# Command to run (dev): docker run -p 8080:80 mifosx:latest