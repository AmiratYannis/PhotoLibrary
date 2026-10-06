FROM node

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
ENV MONGO_URI=mongodb://mongo:27017/photolibrary
CMD ["npm", "start"]