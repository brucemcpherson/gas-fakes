FROM node:22-slim
WORKDIR /usr/src/app

# 1. Copy project-level package files
COPY package*.json ./
RUN npm install --omit=dev

# 2. Copy the test folder content
COPY . .

# 3. Handle the test-specific dependencies
RUN npm install

# 4. Final setup and execution
# Ensure we stay in the test folder so relative paths to appsscript.json work
ENV PORT 8080
EXPOSE 8080

# Execute cloudrun.js from the current folder
CMD ["node", "cloudrun.js"]