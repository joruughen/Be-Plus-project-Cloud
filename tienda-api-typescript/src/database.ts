import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

// Replace `http://localhost:8000` with the endpoint of your DynamoDB instance
const client = new DynamoDBClient({
  region: "local", // Adjust region if necessary
  endpoint: "http://3.230.28.178:8000", // Replace with the IP and Port of your DynamoDB server
    credentials: { accessKeyId: "fakeMyKeyId", secretAccessKey: "fakeSecretAccessKey" }, // Credenciales falsas para evitar errores
});
export const dynamoDB = DynamoDBDocumentClient.from(client);

