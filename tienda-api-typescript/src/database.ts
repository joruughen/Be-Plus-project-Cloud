import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1", // Valor predeterminado para región
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'default_key', // Valor predeterminado si no está definido
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'default_secret', // Valor predeterminado si no está definido
  },
});




export const dynamoDB = DynamoDBDocumentClient.from(client);
