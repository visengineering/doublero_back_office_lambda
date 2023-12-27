import { APIGatewayProxyEvent } from 'common-util/aws/ApiGatewayClient';
import { ApiResponse } from 'common-util/ApiResponse';
import { ProductService } from '../../service/product/ProductService';
import { AuthUtil, Role } from 'common-util/AuthUtil';

export const handler = async (event: APIGatewayProxyEvent) => {
  try {
    AuthUtil.authorizeUser(event, [Role.admin, Role.marketing]);

    const productTypes = await new ProductService().getProductTypes();

    return ApiResponse.success(productTypes, event);
  } catch (error) {
    return ApiResponse.error(error as Error, event);
  }
};
