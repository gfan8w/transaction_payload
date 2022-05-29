# SPDX-License-Identifier: LGPL-3.0-only
FROM node:14.16-alpine
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.ustc.edu.cn/g' /etc/apk/repositories
RUN apk update && apk add make git bash curl \
&& ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime \
&& echo "Asia/Shanghai" > /etc/timezone \
&& rm -rf /var/cache/apk/*
WORKDIR /src
COPY . .
RUN chmod +x entrypoint.sh
RUN npm install
# CMD ["npm","run","test"]
ENTRYPOINT ["/src/entrypoint.sh"]
