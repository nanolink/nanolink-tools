FROM node:16-bullseye AS buildimage
RUN npm add --global documentation

FROM buildimage AS build
COPY ./ /data
WORKDIR /data
RUN npx documentation build src/** --config documentation.yml -f html -o docs

FROM nginx AS finalimage
COPY --from=build /data/docs /usr/share/nginx/html
COPY conf.d /etc/nginx/conf.d
#RUN chmod -R -x /usr/share/nginx/html
