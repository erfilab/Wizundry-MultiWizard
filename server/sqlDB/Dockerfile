FROM mysql:latest

ENV MYSQL_ROOT_PASSWORD pass1234
ENV MYSQL_DATABASE woz
ENV MYSQL_USER user
ENV MYSQL_PASSWORD pass1234

ADD setup.sql /docker-entrypoint-initdb.d
