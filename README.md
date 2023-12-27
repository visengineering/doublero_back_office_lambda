# BackOffice Jobs Service

This repo contains resources for BO jobs and async actions execution, and some other related infrastructure resources.

## Description

This project contains source code and supporting files for a serverless application that you can deploy with the AWS
Serverless Application Model (AWS SAM) command line interface (CLI).

## Project structure:

* [Root Application](template.yaml) contains root stack resources that include other resources
* [CI/CD Template](ci-cd/template.yaml) defines resources needed for CI/CD process.
* [Product Updater](product-updater/template.yaml) defines Product Updater service (deployed as a nested stack) that
  includes all services

## Migrations:
In order to apply migrations create **.env** file within variables as below and provide uri and name for necessary db 
- MONGO_URI=mongodb://root:root@localhost:27017?authSource=admin&ssl=false
- DB_NAME=backoffice-clone

### Handling migrations(commands)
- To run migrations use the command:
`db-migration:up`
- For creating new migrations use:
`db-migration:create`

## Resources

For an introduction to the AWS SAM specification, the AWS SAM CLI, and serverless application concepts, see
the [AWS SAM Developer Guide](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/what-is-sam.html)
.

Next, you can use the AWS Serverless Application Repository to deploy ready-to-use apps that go beyond Hello World
samples and learn how authors developed their applications. For more information, see
the [AWS Serverless Application Repository main page](https://aws.amazon.com/serverless/serverlessrepo/) and
the [AWS Serverless Application Repository Developer Guide](https://docs.aws.amazon.com/serverlessrepo/latest/devguide/what-is-serverlessrepo.html)
.

## Generating new key pair

The following example command uses OpenSSL to generate an RSA key pair with a length of 2048 bits and save to the file named private_key.pem.

`openssl genrsa -out private_key.pem 2048`

The resulting file contains both the public and the private key. The following example command extracts the public key from the file named private_key.pem.

`openssl rsa -pubout -in private_key.pem -out public_key.pem`
