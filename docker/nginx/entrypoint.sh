#!/bin/sh
set -eu

envsubst '${EMPLOYEE_GATEWAY_PROXY_TARGET} ${EMPLOYEE_GATEWAY_PROXY_HOST} ${STUDENT_GATEWAY_PROXY_TARGET} ${STUDENT_GATEWAY_PROXY_HOST}' \
  < /etc/nginx/templates/default.conf.template \
  > /etc/nginx/conf.d/default.conf

exec nginx -g 'daemon off;'
