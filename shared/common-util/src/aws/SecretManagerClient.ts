import { CommunicationError } from '../error/CommunicationError';
import SecretsManager, { GetSecretValueRequest } from 'aws-sdk/clients/secretsmanager';
import { AWSError } from 'aws-sdk/lib/error';

export interface Credentials {
  user: string;
  pass: string;
}

export class SecretManagerClient {

  private static readonly client = new SecretsManager({
    region: process.env.AWS_REGION,
  });

  public static async getSecretValue(secretId: string): Promise<string> {
    console.log(`Reading secret ${secretId}`);

    const param: GetSecretValueRequest = {
      SecretId: secretId,
    };

    let secret;

    try {
      secret = await this.client.getSecretValue(param).promise();

      return secret.SecretString || '';
    } catch (e) {
      const error = e as AWSError;
      console.error(`Error getting secret value: ${error.code}`);
      console.error(error.message);

      throw new CommunicationError(error.message, error);
    }
  }

  public static async getCredentials(secretId: string): Promise<Credentials> {
    const secret = await this.getSecretValue(secretId);

    if (!secret) {
      throw new CommunicationError('Read Auth secret was empty secret');
    }

    const secretValue = JSON.parse(secret);

    return {
      user: secretValue.user,
      pass: secretValue.pass,
    };
  }
}
