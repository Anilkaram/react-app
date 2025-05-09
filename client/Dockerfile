FROM node:18 as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine 
COPY --from=build /app/build /usr/share/nginx/html
RUN npm install --production
# Expose port 80 for the web server
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]