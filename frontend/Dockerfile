# build stage
FROM node:18 AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# production build
RUN npm run build -- --configuration production

# production stage
FROM nginx:stable
# replace with angular dist folder name in the COPY line below
COPY --from=build /app/dist/YOUR_ANGULAR_DIST_NAME /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
