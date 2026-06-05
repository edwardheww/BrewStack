FROM mcr.microsoft.com/playwright:v1.52.0-noble

WORKDIR /app
COPY . .
RUN npm install
EXPOSE 8080
CMD ["sh", "-c", "npx prisma generate && node --import tsx/esm index.ts"]