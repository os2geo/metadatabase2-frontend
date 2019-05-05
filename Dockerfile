FROM node:dubnium
# Create app directory
WORKDIR /usr/src/app
# Install app dependencies
# COPY package.json .
# For npm@5 or later, copy package-lock.json as well
COPY package.json package-lock.json ./

RUN npm install

# Bundle app source
COPY . .
ENV REST=http://metadatabase2-backend
ENV FEATHERS=https://api.metadatabase.os2geo.dk

RUN npm run build

EXPOSE 3000

CMD [ "npm", "start" ]
