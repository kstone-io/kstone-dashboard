FROM node:16.13.0-alpine as build-deps
WORKDIR /usr/src/app
COPY package.json yarn.lock ./
RUN yarn
COPY . ./
RUN export NODE_OPTIONS="--max-old-space-size=8192"; yarn build

FROM nginx:1.21.3-alpine
ADD ./nginx.config /etc/nginx/conf.d/default.conf
COPY --from=build-deps /usr/src/app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]