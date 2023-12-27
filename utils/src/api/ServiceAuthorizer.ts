import { APIGatewayAuthorizerEvent, APIGatewayAuthorizerResult } from 'common-util/aws/ApiGatewayClient';
import { AuthUtil } from 'common-util/AuthUtil';
import { RequestUtil } from 'common-util/RequestUtil';

export const handler = async (event: APIGatewayAuthorizerEvent): Promise<APIGatewayAuthorizerResult> => {
  try {
    const serviceUser = AuthUtil.parseServiceUser(event.headers);

    const serviceSecret = RequestUtil.getEnvParam('BO_SERVICE_SECRET');
    await AuthUtil.hasServicePermission(serviceUser, serviceSecret);

    return buildAllowAllPolicy(event, serviceUser.name);
  } catch (error) {
    throw new Error('Unauthorized');
  }
};

function buildAllowAllPolicy(event: APIGatewayAuthorizerEvent, principalId: string): APIGatewayAuthorizerResult {
  const tmp = event.methodArn.split(':');
  const apiGatewayArnTmp = tmp[5].split('/');
  const awsAccountId = tmp[4];
  const awsRegion = tmp[3];
  const restApiId = apiGatewayArnTmp[0];
  const stage = apiGatewayArnTmp[1];

  const apiArn = `arn:aws:execute-api:${awsRegion}:${awsAccountId}:${restApiId}/${stage}/*/*`;

  return {
    principalId: principalId,
    policyDocument: {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: 'Allow',
          Resource: [apiArn],
        },
      ],
    },
  };
}
