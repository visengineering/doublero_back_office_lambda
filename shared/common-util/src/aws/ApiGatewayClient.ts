import { APIGatewayProxyEvent as AWSAPIGatewayProxyEvent, APIGatewayProxyResult as AWSAPIGatewayProxyResult } from 'aws-lambda';
import type {
  APIGatewayAuthorizerResult as AWSAPIGatewayAuthorizerResult,
  APIGatewayRequestAuthorizerEvent as AWSAPIGatewayRequestAuthorizerEvent
} from 'aws-lambda/trigger/api-gateway-authorizer';

export type APIGatewayProxyEvent = AWSAPIGatewayProxyEvent;
export type APIGatewayProxyResult = AWSAPIGatewayProxyResult;

export type APIGatewayAuthorizerEvent = AWSAPIGatewayRequestAuthorizerEvent;
export type APIGatewayAuthorizerResult = AWSAPIGatewayAuthorizerResult;
