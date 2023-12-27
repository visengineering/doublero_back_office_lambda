import { ErrorUtil } from '../ErrorUtil';
import DynamoDB, {
  AttributeName,
  AttributeValue,
  DeleteItemInput,
  PutItemInput,
  QueryOutput as AWSQueryOutput,
  ScanInput,
  ScanOutput as AWSScanOutput,
} from 'aws-sdk/clients/dynamodb';

export type AttributeMap = { [key: string]: AttributeValue };
export type QueryOutput = AWSQueryOutput | AWSScanOutput;

export class DynamoClient {

  private static readonly client = new DynamoDB({
    region: process.env.AWS_REGION,
  });

  public static attrN(attribute: string): string {
    return '#' + attribute;
  }

  public static async scan(table: string,
                           expression: string | undefined,
                           names: { [key: string]: string } | undefined, values: AttributeMap | undefined,
                           attributes?: string[], limit?: number): Promise<QueryOutput> {
    try {
      const params: ScanInput = {
        TableName: table,
        FilterExpression: expression,
        ExpressionAttributeNames: names,
        ExpressionAttributeValues: values,
      };

      if (attributes && attributes.length) {
        const attributesExp = attributes.map(attr => DynamoClient.attrN(attr));
        params.ProjectionExpression = attributesExp.join(',');

        if (!params.ExpressionAttributeNames) params.ExpressionAttributeNames = {};
        attributes
          .filter(attr => !(DynamoClient.attrN(attr) in <{ [key: string]: AttributeName }>params.ExpressionAttributeNames))
          .forEach(attr => (<{ [key: string]: AttributeName }>params.ExpressionAttributeNames)[DynamoClient.attrN(attr)] = attr);
      }
      if (limit) params.Limit = limit;

      return await this.client.scan(params).promise();
    } catch (e) {
      throw ErrorUtil.communication(`Error while scanning items from ${table} table`, e as Error);
    }
  }

  public static async putItem(table: string, attributes: AttributeMap): Promise<void> {
    try {
      const params: PutItemInput = {
        TableName: table,
        Item: attributes,
      };

      await this.client.putItem(params).promise();
    } catch (e) {
      throw ErrorUtil.communication(`Error while putting item to ${table} table`, e as Error);
    }
  }


  public static async deleteItem(table: string, key: AttributeMap): Promise<void> {
    try {
      const params: DeleteItemInput = {
        TableName: table,
        Key: key,
      };

      await this.client.deleteItem(params).promise();
    } catch (e) {
      throw ErrorUtil.communication(`Error while deleting item from ${table} table`, e as Error);
    }
  }
}
