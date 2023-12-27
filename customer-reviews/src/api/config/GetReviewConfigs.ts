import { APIGatewayProxyEvent } from 'common-util/aws/ApiGatewayClient';
import { ApiResponse } from 'common-util/ApiResponse';
import { ProductReviewsService } from '../../service/ProductReviewsService';
import { AuthUtil, Role } from 'common-util/AuthUtil';

export const handler = async (event: APIGatewayProxyEvent) => {
  try {
    AuthUtil.authorizeUser(event, [Role.admin, Role.marketing]);

    const configs = await new ProductReviewsService().getReviewsConfigs();

    return ApiResponse.success(configs, event);
  } catch (error) {
    return ApiResponse.error(error as Error, event);
  }
};
