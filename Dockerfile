FROM node:18 AS frontend-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

FROM node:18 AS backend
WORKDIR /app/server
COPY server/package*.json ./
RUN npm install
COPY server/ ./

COPY --from=frontend-builder /app/client/dist ./public

EXPOSE 5000

CMD ["npm", "start"]