FROM node as builder

COPY package.json package-lock.json ./

RUN npm ci --only=production && mkdir /frontend && mv ./node_modules ./frontend

WORKDIR /frontend

COPY . .

RUN npm run build

FROM nginx:alpine

COPY ./nginx/nginx.conf /etc/nginx/nginx.conf

RUN rm -rf /usr/share/nginx/html/*

COPY --from=builder /frontend/build /usr/share/nginx/html

EXPOSE 80

ENTRYPOINT ["nginx", "-g", "daemon off;"]