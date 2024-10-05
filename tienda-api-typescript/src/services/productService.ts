import { dynamoDB } from '../database'; // Importamos la conexión de DynamoDB
import { ScanCommand, GetCommand, PutCommand, UpdateCommand, UpdateCommandOutput, DeleteCommand} from '@aws-sdk/lib-dynamodb';
import {ReturnValue} from "@aws-sdk/client-dynamodb";
import { v4 as uuidv4 } from 'uuid';

const tableName = 'Products';

export const productService = {
  // Obtener todos los productos
  getAll: async () => {
    const params = {
      TableName: tableName,
    };
    const data = await dynamoDB.send(new ScanCommand(params));
    return data.Items;
  },

  // Obtener producto por ID
  getById: async (id: string) => {
    const params = {
      TableName: tableName,
      Key: { id },
    };
    const data = await dynamoDB.send(new GetCommand(params));
    return data.Item;
  },

  getByPagination: async (lastEvaluatedKey?: string, limit: number = 10, field?: string, value?: string) => {
    let params: any = {
      TableName: tableName,
      Limit: limit, // Aplicamos el límite en la búsqueda
    };

    // Si lastEvaluatedKey existe (no es la primera solicitud), lo añadimos a los parámetros
    if (lastEvaluatedKey) {
      params.ExclusiveStartKey = { id: lastEvaluatedKey };
    }

    // Si se pasa solo el field, buscamos ítems que tengan ese campo
    if (field && !value) {
      params.FilterExpression = `attribute_exists(#field)`;
      params.ExpressionAttributeNames = {
        '#field': field,
      };

      // Realizamos un Scan completo ignorando temporalmente el límite
      params.Limit = undefined;  // Eliminamos el limit en el Scan inicial
    }

    // Si se pasan tanto el field como el value, filtramos por igualdad del valor
    if (field && value) {
      params.FilterExpression = `attribute_exists(#field) AND #field = :value`;
      params.ExpressionAttributeNames = {
        '#field': field,
      };
      params.ExpressionAttributeValues = {
        ':value': value,
      };

      // Realizamos un Scan completo ignorando temporalmente el límite
      params.Limit = undefined;  // Eliminamos el limit en el Scan inicial
    }

    try {
      // Ejecutamos el ScanCommand
      const data = await dynamoDB.send(new ScanCommand(params));

      // Si no hay ítems en la respuesta, lanzamos un error
      if (!data.Items || data.Items.length === 0) {
        throw new Error('No se encontraron productos');
      }

      // Aplicamos el limit a los ítems filtrados después del scan completo
      const filteredItems = data.Items.slice(0, limit);

      // Devolver los ítems filtrados y la última clave evaluada (si existe)
      return {
        items: filteredItems,
        lastEvaluatedKey: data.LastEvaluatedKey ? data.LastEvaluatedKey.id : null,
      };
    } catch (error) {
      console.error("Error ejecutando la consulta de paginación con filtro:", error);
      throw error;
    }
  },



  // Crear nuevo producto
  create: async (product: any) => {
    const productId = uuidv4(); // Genera un ID único
    const newProduct = {
      id: productId,
      ...product, // Copia el resto de los datos del producto
    };

    const params = {
      TableName: tableName,
      Item: newProduct,
    };
    await dynamoDB.send(new PutCommand(params));
    return newProduct;
  },

  // Actualizar producto, agregando campos nuevos si no existen y eliminando si el valor es null
  update: async (id: string, updates: any) => {
    // Si el cuerpo está vacío, lanzamos un error
    if (Object.keys(updates).length === 0) {
      throw new Error('El cuerpo de la solicitud no puede estar vacío.');
    }

    // Construir las expresiones dinámicas de actualización y eliminación
    let updateExpression = 'set';
    let removeExpression = '';
    const expressionAttributeNames: any = {};
    const expressionAttributeValues: any = {};

    // Iterar sobre las claves en el objeto `updates` para construir la expresión dinámicamente
    Object.keys(updates).forEach((key) => {
      if (updates[key] !== null) {
        // Si el valor no es null, actualizamos o agregamos el campo
        updateExpression += ` #${key} = :${key},`;
        expressionAttributeNames[`#${key}`] = key;
        expressionAttributeValues[`:${key}`] = updates[key];
      } else {
        // Si el valor es null, agregamos la expresión para eliminar el campo
        removeExpression += ` #${key},`;
        expressionAttributeNames[`#${key}`] = key;
      }
    });

    // Quitar las comas finales
    updateExpression = updateExpression.endsWith(',') ? updateExpression.slice(0, -1) : updateExpression;
    removeExpression = removeExpression.endsWith(',') ? removeExpression.slice(0, -1) : removeExpression;

    // Construir el comando de actualización
    const params: any = {
      TableName: tableName,
      Key: { id },
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW' as ReturnValue, // Para obtener los atributos actualizados
    };

    // Si hay campos que actualizar, añadimos la expresión 'set'
    if (updateExpression !== 'set') {
      params.UpdateExpression = updateExpression;
    }

    // Si hay campos que eliminar, añadimos la expresión 'remove'
    if (removeExpression) {
      params.UpdateExpression = params.UpdateExpression ? `${params.UpdateExpression} REMOVE ${removeExpression}` : `REMOVE ${removeExpression}`;
    }

    const result = await dynamoDB.send(new UpdateCommand(params));
    return result.Attributes;
  },

  // Eliminar producto
  delete: async (id: string) => {
    const params = {
      TableName: tableName,
      Key: { id },
    };
    await dynamoDB.send(new DeleteCommand(params));
    return { id };
  },
};
