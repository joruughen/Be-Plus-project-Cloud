import boto3
import json

# Datos de DynamoDB
dynamodb_table_name = "Products"

# Datos de S3
nombreBucket = "sslo-output01"  # Nombre del bucket S3
json_file_prefix = "products_data_part"  # Prefijo de los archivos JSON
max_items_per_file = 100  # Puedes ajustar cuántos items almacenar por archivo, si prefieres dividirlo por número de elementos en lugar de tamaño

# Conectar a DynamoDB usando boto3
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(dynamodb_table_name)

# Conectar a S3 usando boto3
s3 = boto3.client('s3')

# Inicializar variables para paginación
response = table.scan()
data = response['Items']
part = 1  # Número de parte del archivo JSON

# Función para subir un archivo a S3
def upload_to_s3(file_name, bucket_name):
    s3.upload_file(file_name, bucket_name, file_name)
    print(f"Archivo {file_name} subido a S3 en el bucket {bucket_name}")

# Función para escribir datos en archivo JSON
def save_json_to_file(data, part):
    file_name = f"{json_file_prefix}{part}.json"
    with open(file_name, 'w') as json_file:
        json.dump(data, json_file, indent=4)
    return file_name

# Guardar el primer lote y subirlo
file_name = save_json_to_file(data, part)
upload_to_s3(file_name, nombreBucket)

# Manejar la paginación
while 'LastEvaluatedKey' in response:
    part += 1  # Incrementar la parte del archivo
    response = table.scan(ExclusiveStartKey=response['LastEvaluatedKey'])
    data = response['Items']

    # Guardar el siguiente lote en un nuevo archivo JSON
    file_name = save_json_to_file(data, part)
    upload_to_s3(file_name, nombreBucket)

print("Ingesta completada y archivos subidos a S3")
