FROM node:20-alpine
WORKDIR /app
COPY apps/api/package*.json ./
RUN npm install
COPY apps/api/src ./src
COPY apps/api/.env.example ./.env.example
COPY packages/db /packages/db
COPY docs /docs
CMD ["sh", "-c", "node src/scripts/migrate.js && node src/scripts/seed.js && npm start"]
