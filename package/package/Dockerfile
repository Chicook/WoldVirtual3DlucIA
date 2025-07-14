# Dockerfile para Apollo Package Manager
FROM node:18-alpine

# Establecer directorio de trabajo
WORKDIR /app

# Instalar dependencias del sistema
RUN apk add --no-cache \
    curl \
    git \
    python3 \
    make \
    g++ \
    && rm -rf /var/cache/apk/*

# Copiar archivos de configuración
COPY package*.json ./
COPY .env.example .env

# Instalar dependencias
RUN npm ci --only=production && npm cache clean --force

# Copiar código fuente
COPY . .

# Crear directorios necesarios
RUN mkdir -p cache logs

# Exponer puerto
EXPOSE 4001

# Variables de entorno
ENV NODE_ENV=production
ENV PACKAGE_MANAGER_PORT=4001
ENV PACKAGE_MANAGER_HOST=0.0.0.0

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:4001/api/health || exit 1

# Comando de inicio
CMD ["npm", "start"] 