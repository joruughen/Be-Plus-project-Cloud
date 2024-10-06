import boto3
import json


dynamodb_table_name = "Products"


nombreBucket = "test-1-dynamo"
json_file_prefix = "products_data_part"
max_items_per_file = 100


dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(dynamodb_table_name)


s3 = boto3.client('s3')


response = table.scan()
data = response['Items']
part = 1


def upload_to_s3(file_name, bucket_name):
    s3.upload_file(file_name, bucket_name, file_name)
    print(f"Archivo {file_name} subido a S3 en el bucket {bucket_name}")


def save_json_to_file(data, part):
    file_name = f"{json_file_prefix}{part}.json"
    with open(file_name, 'w') as json_file:
        json.dump(data, json_file, indent=4)
    return file_name


file_name = save_json_to_file(data, part)
upload_to_s3(file_name, nombreBucket)


while 'LastEvaluatedKey' in response:
    part += 1
    response = table.scan(ExclusiveStartKey=response['LastEvaluatedKey'])
    data = response['Items']


    file_name = save_json_to_file(data, part)
    upload_to_s3(file_name, nombreBucket)

print("Ingesta completada y archivos subidos a S3")
