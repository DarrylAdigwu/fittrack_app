# Stage 3: Build backend
FROM node:23.11-alpine
WORKDIR /fitTrack
COPY ./package.json .
RUN npm install
COPY . .
EXPOSE 3000
CMD [ "node", "server.js" ]