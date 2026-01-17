# ---------- Build stage ----------
FROM node:20-alpine AS build
WORKDIR /app

# Cài deps ổn định
COPY package*.json ./
RUN npm ci

# Copy source và build
COPY . .
RUN npm run build

# ---------- Run stage ----------
FROM nginx:alpine

# Nginx config (SPA + reverse proxy)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build output (CRA => /app/build)
COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
