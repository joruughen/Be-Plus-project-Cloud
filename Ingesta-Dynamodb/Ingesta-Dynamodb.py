dynamodb = boto3.client('dynamodb')

response = dynamodb.create_table(
    TableName=dynamodb_table_name,
    KeySchema=[
        {
            'AttributeName': 'idFabricante',  # Cambia este valor a la clave primaria que desees
            'KeyType': 'HASH'  # La clave HASH es la clave primaria en DynamoDB
        }
    ],
    AttributeDefinitions=[
        {
            'AttributeName': 'idFabricante',  # Define el tipo de dato de la clave
            'AttributeType': 'S'  # 'S' para String, 'N' para número
        }
    ],
    ProvisionedThroughput={
        'ReadCapacityUnits': 5,
        'WriteCapacityUnits': 5
    }
)

print("Tabla DynamoDB creada con éxito")
