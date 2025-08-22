FROM node:22-slim

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY README.md .env.example ./
COPY dist ./dist

CMD ["node", "dist/main.js"]