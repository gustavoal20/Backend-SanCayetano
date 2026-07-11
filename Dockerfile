# Usamos una imagen oficial y ligera de Node.js
FROM node:20-alpine

# Directorio de trabajo en el contenedor
WORKDIR /usr/src/app

# Copiamos package.json y package-lock.json
COPY package*.json ./

# Instalamos dependencias de producción
RUN npm install --only=production

# Copiamos el resto del código del backend
COPY . .

# Exponemos el puerto (Cloud Run suele usar el puerto 8080 por defecto)
EXPOSE 8080

# Comando para iniciar la aplicación
CMD ["node", "app.js"]
