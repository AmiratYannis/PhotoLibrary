FROM node:20-alpine AS build
WORKDIR /client

COPY package*.json ./

RUN npm install
COPY . .
RUN npm run build

RUN npm install -g serve

EXPOSE 5173

CMD ["serve", "-s", "dist", "-l", "5173"]