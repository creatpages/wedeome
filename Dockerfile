FROM php:8.0.3-fpm-alpine

WORKDIR /var/www/wedeome

RUN docker-php-ext-install mysqli

COPY --chown=www:www . /var/www/wedeome

EXPOSE 9000