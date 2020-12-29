FROM ubuntu:18.04

RUN apt-get update && apt-get dist-upgrade -y && apt-get install -y git net-tools curl wget vim nginx \
    && curl -sL https://deb.nodesource.com/setup_15.x | bash - \
    && apt-get install -y nodejs \
    && cd /opt && git clone https://github.com/thaihust/chatcord.git \
    && cd /opt/chatcord && npm install \
    && mkdir -p /etc/nginx/ssl

COPY nginx/nginx.conf /etc/nginx/nginx.conf
COPY nginx/conf.d/websocket.cloudrity.site.conf /etc/nginx/conf.d
COPY nginx/conf.d/websocket.cloudrity.site.conf-http /etc/nginx/conf.d
COPY nginx/conf.d/websocket.cloudrity.site.conf-https /etc/nginx/conf.d
COPY nginx/ssl/websocket.cloudrity.site443.crt /etc/nginx/ssl
COPY nginx/ssl/websocket.cloudrity.site443.key /etc/nginx/ssl
COPY start.sh /usr/local/bin

CMD ["/usr/local/bin/start.sh"]
