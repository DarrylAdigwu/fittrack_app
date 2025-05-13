# Stage 1: Build React application
FROM node:23.11-alpine AS build-client
WORKDIR /fitTrack/client
COPY client/package*.json ./
RUN npm install
COPY client .
RUN npm run build

# Stage 2: Build backend
FROM node:23.11-alpine AS build-server
WORKDIR /fitTrack/server
COPY server/package*.json ./
RUN npm install
COPY server .

# Stage 3: Build Nginx
FROM nginx:1.27.4-alpine-slim AS runner
COPY --from=build-client /fitTrack/client/dist /usr/share/nginx/html
COPY client/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build-server /fitTrack/server /fitTrack/server
EXPOSE 80
EXPOSE 3000
CMD ["node /app/server.js & nginx -g 'daemon off;'"]