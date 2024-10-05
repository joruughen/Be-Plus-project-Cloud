import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

// Replace `http://localhost:8000` with the endpoint of your DynamoDB instance
const client = new DynamoDBClient({
  region: "us-east-1", // Adjust region if necessary
  endpoint: "http://localhost:8000", // Replace with the IP and Port of your DynamoDB server
});
export const dynamoDB = DynamoDBDocumentClient.from(client);

