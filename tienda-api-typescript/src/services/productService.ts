import { dynamoDB } from '../database';
import { PutCommand, ScanCommand, GetCommand, UpdateCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';

const tableName = 'Products';

export const productService = {
  // Obtener todos los productos
  getAll: async () => {
    const params = { TableName: tableName };
    const result = await dynamoDB.send(new ScanCommand(params));
    return result.Items;
  },

  // Obtener producto por ID
  getById: async (id: string) => {
    const params = { TableName: tableName, Key: { productId: id } };
    const result = await dynamoDB.send(new GetCommand(params));
    return result.Item;
  },

  // Crear nuevo producto
  create: async (product: any) => {
    const params = { TableName: tableName, Item: product };
    await dynamoDB.send(new PutCommand(params));
    return product;
  },

  // Actualizar producto
  update: async (id: string, updates: any) => {
    const params = {
      TableName: tableName,
      Key: { productId: id }, // Asegúrate de que la clave sea correcta
      UpdateExpression: 'SET productName = :name', // Aquí defines los campos que se van a actualizar
      ExpressionAttributeValues: { ':name': updates.productName }, // Aquí mapeas los valores a actualizar
      ReturnValues: 'ALL_NEW' as const, // Tipo correcto para ReturnValues
    };

    const result = await dynamoDB.send(new UpdateCommand(params));
    return result.Attributes;
  },

  // Eliminar producto
  delete: async (id: string) => {
    const params = { TableName: tableName, Key: { productId: id } };
    await dynamoDB.send(new DeleteCommand(params));
  },
};
