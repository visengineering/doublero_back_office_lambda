import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'common-util/aws/ApiGatewayClient';
import { ApiResponse } from 'common-util/ApiResponse';
import { RequestUtil } from 'common-util/RequestUtil';
import { ProductLayoutsFeedService } from '../../service/feed/ProductLayoutsFeedService';
import { FeedUpdateAction } from '../../model/Feed';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    console.log(`Got product-layout feed populate request: ${JSON.stringify(event)}`);

    const sku = RequestUtil.getPathParam(event, 'sku');
    const action = event.pathParameters?.action;
    if (action === FeedUpdateAction.delete) {
      await new ProductLayoutsFeedService().deleteProductFromProductLayoutFeed(sku);
    } else {
      await new ProductLayoutsFeedService().populateFeed(sku);
    }
    return ApiResponse.success({}, event);
  } catch (error) {
    const errorAware = RequestUtil.getHeader(event, 'errors_aware', true) == 'true';
    if (errorAware) throw error;

    return ApiResponse.error(error as Error, event);
  }
};
