import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'common-util/aws/ApiGatewayClient';
import { ApiResponse } from 'common-util/ApiResponse';
import { RequestUtil } from 'common-util/RequestUtil';
import { ProductReviewsService } from '../../service/ProductReviewsService';
import { ProductReviewConfig } from '../../model/ProductReviewConfig';
import { AuthUtil, Role } from 'common-util/AuthUtil';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    AuthUtil.authorizeUser(event, [Role.admin, Role.marketing]);

    const reviewsConfigs: ProductReviewConfig[] = RequestUtil.getBody(event);

    await new ProductReviewsService().updateReviewsConfigs(reviewsConfigs);

    return ApiResponse.success({}, event);
  } catch (error) {
    return ApiResponse.error(error as Error, event);
  }
};
