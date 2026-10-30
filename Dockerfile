FROM node:22-slim

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 8080
CMD ["sh", "-c", "npx prisma generate && node --import tsx/esm index.ts"]
