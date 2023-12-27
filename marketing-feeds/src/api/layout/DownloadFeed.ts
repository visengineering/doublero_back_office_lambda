import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'common-util/aws/ApiGatewayClient';
import { ApiResponse } from 'common-util/ApiResponse';
import { RequestUtil } from 'common-util/RequestUtil';
import { ProductLayoutsFeedService } from '../../service/feed/ProductLayoutsFeedService';
import { ValidationUtil } from 'common-util/ValidationUtil';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    console.log(`Got product-layout feed download request: ${JSON.stringify(event)}`);

    const key = ValidationUtil.validateString('key', RequestUtil.getQueryParam(event, 'key'), ValidationUtil.stringFormat(10, 64));
    const referrer = ValidationUtil.validateString('name', RequestUtil.getQueryParam(event, 'name', true),
      ValidationUtil.stringFormat(1, 32, false, 'unknown')
    );

    const feedUrl = await new ProductLayoutsFeedService().downloadFeed(key, referrer);

    return ApiResponse.redirect(feedUrl, event, 303); // HTTP/1.1 303 See Other
  } catch (error) {
    return ApiResponse.error(error as Error, event);
  }
};
