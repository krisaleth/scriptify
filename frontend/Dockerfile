# Bước 1: Build React app
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Bước 2: Serve với Nginx
FROM nginx:stable-alpine
# Copy file build từ bước 1 sang thư mục của Nginx
COPY --from=build /app/dist /usr/share/nginx/html
# Copy file cấu hình nginx (nếu bồ có route react-router-dom)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]