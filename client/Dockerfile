# Stage 1: Build React application
FROM node:23.11-alpine AS builder
WORKDIR /fitTrack
COPY package.json .
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Build Nginx
FROM nginx:1.27.4-alpine-slim AS runner
COPY --from=builder /fitTrack/dist /usr/share/nginx/html
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD [ "nginx", "-g", "daemon off;" ]