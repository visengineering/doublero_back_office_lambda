import { APIGatewayProxyEvent } from 'common-util/aws/ApiGatewayClient';
import { ApiResponse } from 'common-util/ApiResponse';
import { RequestUtil } from 'common-util/RequestUtil';
import { ProductReviewsService } from '../../service/ProductReviewsService';
import { AuthUtil, Role } from 'common-util/AuthUtil';

export const handler = async (event: APIGatewayProxyEvent) => {
  try {
    AuthUtil.authorizeUser(event, [Role.admin, Role.marketing]);

    const page = RequestUtil.getPageParam(event);
    const sku = RequestUtil.getPathParam(event, 'sku');

    const productReviewsBySku = await new ProductReviewsService().getReviewsBySku(page, sku);

    return ApiResponse.success(productReviewsBySku, event);
  } catch (error) {
    return ApiResponse.error(error as Error, event);
  }
};
