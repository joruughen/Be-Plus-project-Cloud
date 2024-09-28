# Usar una imagen base de Node.js
FROM node:18-alpine

# Establecer el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiar el package.json y package-lock.json
COPY package*.json ./

# Instalar las dependencias
RUN npm install

# Copiar el resto de la aplicación
COPY . .

# Compilar TypeScript a JavaScript
RUN npm run build

# Exponer el puerto en el que corre tu aplicación
EXPOSE 3000

# Ejecutar la aplicación (el archivo de salida debe estar en dist/index.js)
CMD ["npm", "start"]

