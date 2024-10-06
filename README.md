# Be-Plus-project-Cloud


Con los siguientes comandos se crea a base de datos en una MV:


docker pull amazon/dynamodb-local:latest

docker run -d --rm --name dynamo_c -p 8000:8000 amazon/dynamodb-local:latest -jar DynamoDBLocal.jar -sharedDb


Posterior a eso desde cualquier maquina podemos crear una tabla con:

aws dynamodb create-table \
--table-name Products \
--attribute-definitions AttributeName=id,AttributeType=S \
--key-schema AttributeName=id,KeyType=HASH \
--billing-mode PAY_PER_REQUEST \
--endpoint-url http://<Tu_IP>:8000





