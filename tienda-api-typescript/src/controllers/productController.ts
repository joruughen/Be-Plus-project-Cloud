import express from 'express';
import { productService } from '../services/productService';
const productRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: Productos
 *   description: Operaciones con productos
 */

/**
 * @swagger
 * /productos:
 *   get:
 *     summary: Obtiene todos los productos
 *     tags: [Productos]
 *     responses:
 *       200:
 *         description: Lista de productos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       500:
 *         description: Error interno del servidor
 */
productRouter.get('/', async (req, res) => {
  try {
    const products = await productService.getAll();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener productos', error: (error as Error).message });
  }
});

/**
 * @swagger
 * /productos/pagination:
 *   get:
 *     summary: Obtiene productos paginados con un límite opcional y filtrado por campo y valor
 *     tags: [Productos]
 *     parameters:
 *       - in: query
 *         name: lastKey
 *         schema:
 *           type: string
 *         required: false
 *         description: Última clave evaluada para continuar la paginación
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 10
 *         required: false
 *         description: Número de productos a devolver en la paginación. Debe ser un entero positivo.
 *       - in: query
 *         name: field
 *         schema:
 *           type: string
 *         required: false
 *         description: Campo a filtrar. Si se pasa, buscará por la existencia de este campo en los productos.
 *       - in: query
 *         name: value
 *         schema:
 *           type: string
 *         required: false
 *         description: Valor del campo a filtrar. Si se pasa junto con "field", buscará productos cuyo campo tenga este valor.
 *     responses:
 *       200:
 *         description: Productos obtenidos con éxito
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 items:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "uuid-1"
 *                       name:
 *                         type: string
 *                         example: "Producto 1"
 *                       price:
 *                         type: number
 *                         example: 100
 *                 lastEvaluatedKey:
 *                   type: string
 *                   example: "uuid-3"
 *       400:
 *         description: Parámetro inválido en la solicitud
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Debes especificar un campo si vas a buscar por valor."
 *       404:
 *         description: No se encontraron productos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Producto no encontrado"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error al obtener productos por paginación"
 *                 error:
 *                   type: string
 *                   example: "Mensaje detallado del error"
 */
productRouter.get('/pagination', async (req, res) => {
  const lastKey = req.query.lastKey as string;
  const limit = parseInt(req.query.limit as string);
  const field = req.query.field as string;  // Nuevo campo para filtrar
  const value = req.query.value as string;  // Valor del campo a filtrar

  // Validar el límite
  if (isNaN(limit) || limit <= 0) {
    return res.status(400).json({ message: 'El parámetro "limit" debe ser un número entero positivo.' });
  }

  // Si se pasa un valor sin un campo, devolver un error
  if (!field && value) {
    return res.status(400).json({ message: 'Debes especificar un campo si vas a buscar por valor.' });
  }

  try {
    const result = await productService.getByPagination(lastKey, limit, field, value);
    res.json({
      items: result.items,
      lastEvaluatedKey: result.lastEvaluatedKey,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'No se encontraron productos') {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    res.status(500).json({ message: 'Error al obtener productos por paginación', error: (error as Error).message });
  }
});


/**
 * @swagger
 * /productos/{id}:
 *   get:
 *     summary: Obtiene un producto por ID
 *     tags: [Productos]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del producto
 *     responses:
 *       200:
 *         description: Producto encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       404:
 *         description: Producto no encontrado
 *       500:
 *         description: Error interno del servidor
 */
productRouter.get('/:id', async (req, res) => {
  try {
    const product = await productService.getById(req.params.id);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Producto no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el producto', error: (error as Error).message });
  }
});

/**
 * @swagger
 * /productos:
 *   post:
 *     summary: Crea un nuevo producto
 *     tags: [Productos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *             required:
 *               - name
 *               - price
 *     responses:
 *       201:
 *         description: Producto creado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         description: El cuerpo de la solicitud está incompleto
 *       500:
 *         description: Error interno del servidor
 */
productRouter.post('/', async (req, res) => {

  // Validación del cuerpo de la solicitud
  if (Object.keys(req.body).length === 0) {
    return res.status(400).json({ message: 'El cuerpo de la solicitud está incompleto. Se requiere "name" y "price".' });
  }

  try {
    const newProduct = await productService.create(req.body);
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear el producto', error: (error as Error).message });
  }
});

/**
 * @swagger
 * /productos/{id}:
 *   put:
 *     summary: Actualiza un producto o elimina campos (enviar `null` elimina el campo)
 *     description: |
 *       Este endpoint permite actualizar los campos de un producto o eliminarlos enviando `null`.
 *       - Si envías `null` en un campo, ese campo será **eliminado** de la base de datos.
 *       - Si envías un valor, ese campo será actualizado.
 *       - Los campos que no envíes quedarán sin cambios.
 *       - Si envias un campo no presente, será creado.
 *     tags: [Productos]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del producto que se actualizará
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: "Nombre del producto. Si se envía, actualizará este campo."
 *                 example: "Nuevo producto"
 *               price:
 *                 type: number
 *                 nullable: true
 *                 description: "Precio del producto. Si es `null`, se eliminará el campo `price`."
 *                 example: null
 *     responses:
 *       200:
 *         description: Producto actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         description: El cuerpo de la solicitud no puede estar vacío
 *       404:
 *         description: Producto no encontrado
 *       500:
 *         description: Error interno del servidor
 */
productRouter.put('/:id', async (req, res) => {
  try {
    // Validar si el cuerpo está vacío
    if (Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: 'El cuerpo de la solicitud no puede estar vacío.' });
    }

    // Llamar al servicio para actualizar el producto
    const updatedProduct = await productService.update(req.params.id, req.body);

    if (updatedProduct) {
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Producto no encontrado.' });
    }
  } catch (error) {
    if ((error as Error).message === 'El cuerpo de la solicitud no puede estar vacío.') {
      res.status(400).json({ message: (error as Error).message });
    } else {
      res.status(500).json({ message: 'Error al actualizar el producto', error: (error as Error).message });
    }
  }
});


/**
 * @swagger
 * /productos/{id}:
 *   delete:
 *     summary: Elimina un producto
 *     tags: [Productos]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del producto
 *     responses:
 *       200:
 *         description: Producto eliminado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       404:
 *         description: Producto no encontrado
 *       500:
 *         description: Error interno del servidor
 */
productRouter.delete('/:id', async (req, res) => {
  try {
    const deletedProduct = await productService.delete(req.params.id);
    if (deletedProduct) {
      res.json({ message: 'Producto eliminado' });
    } else {
      res.status(404).json({ message: 'Producto no encontrado.' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el producto', error: (error as Error).message });
  }
});

export default productRouter;
