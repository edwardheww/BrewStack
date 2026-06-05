FROM mcr.microsoft.com/playwright:v1.52.0-noble

WORKDIR /app
COPY . .
RUN npm install
EXPOSE 8080
CMD ["node", "--import", "tsx/esm", "index.ts"]