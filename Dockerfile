# 1. Start from the node:18-slim base image.
FROM node:18-slim

# 2. Set a working directory, e.g., /app.
WORKDIR /app

# 3. Install pnpm globally in the image (e.g., npm install -g pnpm).
RUN npm install -g pnpm

# 4. Copy package.json, pnpm-lock.yaml, and pnpm-workspace.yaml to the working directory.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# 5. Copy the packages/ directory into the /app/packages/ directory in the image.
COPY packages/ ./packages/

# 6. Copy the tsconfig.json file to the working directory.
COPY tsconfig.json ./

# 7. Run pnpm install --frozen-lockfile to install dependencies.
RUN pnpm install --frozen-lockfile

# 8. Run the build script for the @plebeian/app package: pnpm --filter @plebeian/app build.
RUN pnpm --filter @plebeian/app build

# 9. Set the environment variable PORT to 3000.
ENV PORT=3000

# 10. Expose port 3000.
EXPOSE 3000

# 11. Set the CMD to node packages/app/build/index.js.
CMD ["node", "packages/app/build/index.js"]
