import { APIGatewayProxyEvent } from 'common-util/aws/ApiGatewayClient';
import { ApiResponse } from 'common-util/ApiResponse';
import { RequestUtil } from 'common-util/RequestUtil';
import { ShoppingFeedService } from '../../service/feed/ShoppingFeedService';
import { ValidationUtil } from 'common-util/ValidationUtil';
import { AuthUtil, Role } from 'common-util/AuthUtil';

export const handler = async (event: APIGatewayProxyEvent) => {
  try {
    AuthUtil.authorizeUser(event, [Role.admin, Role.marketing]);

    console.log(`Got shopping feed get request: ${JSON.stringify(event)}`);

    const page = RequestUtil.getPageParam(event);
    const salesLabel = ValidationUtil.validateString('sales_label',
      RequestUtil.getQueryParam(event, 'sales_label', true),
      ValidationUtil.enumFormat(['0', '1', '2', '3', '4', '5'], false)
    );
    const productType = ValidationUtil.validateString('product_type',
      RequestUtil.getQueryParam(event, 'product_type', true),
      ValidationUtil.stringFormat(1, 128, false)
    );
    const query = ValidationUtil.validateString('query',
      RequestUtil.getQueryParam(event, 'query', true),
      ValidationUtil.stringFormat(1, 200, false)
    );

    const feed = await ShoppingFeedService.getFeed(page, salesLabel, productType, query);

    return ApiResponse.success(feed, event);
  } catch (error) {
    return ApiResponse.error(error as Error, event);
  }
};
