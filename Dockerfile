FROM ubuntu:18.04

RUN apt-get update && apt-get dist-upgrade -y && apt-get install -y git net-tools curl wget vim nginx \
    && curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.37.2/install.sh | bash \
    && export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")" \
    && [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" \
    && nvm install v15.4.0 \
    && ln -s /root/.nvm/versions/node/v15.4.0/bin/node /usr/bin/node \
    && cd /opt && git clone https://github.com/thaihust/chatcord.git \
    && cd /opt/chatcord && npm install \
    && mkdir -p /etc/nginx/ssl

COPY nginx/nginx.conf /etc/nginx/nginx.conf
COPY nginx/conf.d/websocket.cloudrity.site.conf /etc/nginx/conf.d
COPY nginx/conf.d/websocket.cloudrity.site.conf-http /etc/nginx/conf.d
COPY nginx/conf.d/websocket.cloudrity.site.conf-https /etc/nginx/conf.d
COPY nginx/ssl/websocket.cloudrity.site443.crt /etc/nginx/ssl
COPY nginx/ssl/websocket.cloudrity.site443.key /etc/nginx/ssl
COPY start /usr/local/bin
COPY start-streaming-server /usr/local/bin

CMD ["/usr/local/bin/start"]
