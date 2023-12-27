import { APIGatewayProxyEvent } from 'common-util/aws/ApiGatewayClient';
import { ApiResponse } from 'common-util/ApiResponse';
import { RequestUtil } from 'common-util/RequestUtil';
import { ProductReviewsService } from '../../service/ProductReviewsService';
import { ProductReviewProductType, ProductReviewSource } from '../../model/ProductReview';
import { AuthUtil, Role } from 'common-util/AuthUtil';

export const handler = async (event: APIGatewayProxyEvent) => {
  try {
    AuthUtil.authorizeUser(event, [Role.admin, Role.marketing]);

    const page = RequestUtil.getPageParam(event);
    const query = RequestUtil.getQueryParam(event, 'query', true);
    const source = RequestUtil.getQueryParam(event, 'source', true) as ProductReviewSource;
    const productType = RequestUtil.getQueryParam(event, 'product_type', true) as ProductReviewProductType;

    const productReviews = await new ProductReviewsService().getProductReviewsWithPagination(page, query, source, productType);

    return ApiResponse.success(productReviews, event);
  } catch (error) {
    return ApiResponse.error(error as Error, event);
  }
};
