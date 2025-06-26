FROM node:20-slim

# Install ffmpeg
RUN apt-get update && \
    apt-get install -y ffmpeg && \
    rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Copy files and install deps
COPY . .
RUN npm install

# Expose the app's port
EXPOSE 3000

# Start the server
CMD ["npm", "start"]
