FROM node:18-alpine
WORKDIR /usr/src/app

# install deps
COPY package*.json ./
RUN npm ci --only=production

# copy source
COPY . .

# ensure environment variable default
ENV PORT=3000

EXPOSE 3000

# use npm start (ensure package.json has a start script)
CMD ["npm", "start"]
