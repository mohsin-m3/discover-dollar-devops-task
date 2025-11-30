# frontend/Dockerfile

# 1) Build stage
FROM node:18-alpine AS builder
WORKDIR /app

# copy package files first for layer caching
COPY package*.json ./
RUN npm ci

# copy source and build
COPY . .
# use the npm script if present; otherwise this runs the Angular CLI build directly
RUN npm run build -- --prod --output-path=dist/angular-15-crud

# 2) Production stage with nginx
FROM nginx:stable-alpine
# remove default nginx.conf if you will copy a custom one
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# copy built files from the builder stage to nginx html folder
COPY --from=builder /app/dist/angular-15-crud /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
