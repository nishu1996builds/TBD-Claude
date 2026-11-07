FROM node:22-alpine
WORKDIR /app
COPY package.json ./
COPY src ./src
COPY public ./public
ENV NODE_ENV=production PORT=8402 SOFTOPEN_DB=/data/softopen.db
VOLUME ["/data"]
EXPOSE 8402
CMD ["node", "--no-warnings=ExperimentalWarning", "src/server.mjs"]
