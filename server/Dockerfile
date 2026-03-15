FROM node:20-slim

WORKDIR /app

COPY package*.json ./
RUN npm install --include=dev

COPY . .
RUN npx tsc

ENV NODE_ENV=production
EXPOSE 8080

CMD ["node", "dist/index.js"]
