FROM node:alpine

# Create app directory
WORKDIR "/app"

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install
# alpine images don't include curl by default; install it so healthchecks using curl work
RUN apk add --no-cache curl
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY . .
CMD ["npm", "run", "start"]