FROM node:24-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:1.29-alpine
RUN apk add --no-cache gettext

ENV EMPLOYEE_GATEWAY_PROXY_TARGET=http://employee-api-gateway:8082 \
    EMPLOYEE_GATEWAY_PROXY_HOST=employee-api-gateway \
    STUDENT_GATEWAY_PROXY_TARGET=http://student-api-gateway:8081 \
    STUDENT_GATEWAY_PROXY_HOST=student-api-gateway

COPY --from=build /app/dist /usr/share/nginx/html
COPY docker/nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY docker/nginx/entrypoint.sh /entrypoint.sh

RUN chmod +x /entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/entrypoint.sh"]
