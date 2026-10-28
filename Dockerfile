# 自托管镜像：核心静态文件 + server/host.js + plugins/，零 npm 依赖
FROM node:24-alpine
RUN apk add --no-cache tzdata
WORKDIR /app
COPY index.html styles.css ./
COPY js/ js/
COPY server/ server/
COPY plugins/ plugins/
RUN mkdir -p /data && chown node:node /data
USER node
ENV PORT=8142 DATA_DIR=/data
EXPOSE 8142
HEALTHCHECK --interval=60s --timeout=5s CMD wget -qO- http://127.0.0.1:8142/ >/dev/null || exit 1
CMD ["node", "server/host.js"]
