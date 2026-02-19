# Dockerfile (DEV) para correr una app React (TS/TSX) con Vite
FROM node:20-slim

WORKDIR /app

# Instala dependencias primero (cache)
COPY package.json package-lock.json* ./
RUN npm install --no-audit --no-fund

# Copia el resto
COPY . .

# Vite por defecto usa 5173
EXPOSE 5173

# Levanta el dev server accesible desde fuera del contenedor
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]