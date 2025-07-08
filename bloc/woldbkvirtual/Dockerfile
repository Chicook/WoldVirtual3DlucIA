# Dockerfile para WoldVirtual3D Blockchain
FROM node:18-alpine

# Instalar dependencias del sistema
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    git \
    curl

# Crear directorio de trabajo
WORKDIR /app

# Copiar archivos de configuración
COPY package*.json ./
COPY tsconfig.json ./
COPY .eslintrc.js ./
COPY .prettierrc ./
COPY jest.config.js ./
COPY typedoc.json ./

# Instalar dependencias
RUN npm ci --only=production

# Copiar código fuente
COPY src/ ./src/
COPY python_blockchain.py ./
COPY start-chain.js ./
COPY network-config.json ./
COPY README.md ./

# Compilar TypeScript
RUN npm run build

# Crear usuario no-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S blockchain -u 1001

# Cambiar permisos
RUN chown -R blockchain:nodejs /app
USER blockchain

# Exponer puertos
EXPOSE 8545 8546 8547 8548

# Variables de entorno
ENV NODE_ENV=production
ENV PORT=8546
ENV WS_PORT=8547
ENV BRIDGE_PORT=8548

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8546/health || exit 1

# Comando por defecto
CMD ["npm", "start"] 