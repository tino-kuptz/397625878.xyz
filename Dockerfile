FROM node:24-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY --chown=node:node src ./src
COPY --chown=node:node LICENSE ./LICENSE

USER node
ENV NODE_ENV=production
EXPOSE 8787

CMD ["node", "src/index.js"]
