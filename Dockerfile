FROM node:20

# Create and change to the app directory
WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

# Copy the rest of the application code
COPY . .

# Ensure the .env file is copied to the container
COPY ./src/.env ./src/.env

EXPOSE ${PORT}

CMD ["node", "src/index.js"]
