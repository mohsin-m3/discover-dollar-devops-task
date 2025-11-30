# backend/Dockerfile
FROM node:18-alpine AS builder
WORKDIR /app

# copy package files first for layer caching
COPY package*.json ./

# install production deps only (faster, lean)
RUN npm install --only=production

# copy app source
COPY . .

# final image
FROM node:18-alpine
WORKDIR /app

# copy installed node_modules and app source from builder
COPY --from=builder /app /app

ENV NODE_ENV=production
# expose the port your app listens on (default 8080)
EXPOSE 8080

# Use npm start if you added the start script; otherwise node server.js works too
CMD ["node", "server.js"]
# alternatively: CMD ["npm", "start"]
