# Stage 1: Build React
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve với Nginx
FROM nginx:stable-alpine

# COPY FILE CONFIG NÀY VÀO ĐÂY
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy thư mục build từ Stage 1 (Vite dùng 'dist', Create React App dùng 'build')
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]