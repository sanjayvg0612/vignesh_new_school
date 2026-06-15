FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm build
CMD [ "npm", "start"]
EXPOSE 80
