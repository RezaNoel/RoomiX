# Base image
FROM node:16

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json /app/
RUN npm install

# Copy React project files
COPY . /app

# Expose the React port
EXPOSE 3000

# Run the React development server
CMD ["npm", "start"]
