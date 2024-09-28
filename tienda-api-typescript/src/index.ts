import express from 'express';
import productRouter from './controllers/productController';
import { swaggerDocs } from './swagger';

const app = express();
const port = 3000;

app.use(express.json()); // Para poder leer JSON en los requests

// Usar el router de productos
app.use('/productos', productRouter);

// Integrar la documentación de Swagger
swaggerDocs(app, port);

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
