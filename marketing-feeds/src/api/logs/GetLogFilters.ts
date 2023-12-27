import { APIGatewayProxyEvent } from 'common-util/aws/ApiGatewayClient';
import { ApiResponse } from 'common-util/ApiResponse';
import { FeedLogsService } from '../../service/feed/FeedLogsService';
import { AuthUtil, Role } from 'common-util/AuthUtil';

export const handler = async (event: APIGatewayProxyEvent) => {
  try {
    AuthUtil.authorizeUser(event, [Role.admin, Role.marketing]);

    const logFiltersData = await new FeedLogsService().getFeedLogFilters();

    return ApiResponse.success(logFiltersData, event);
  } catch (error) {
    return ApiResponse.error(error as Error, event);
  }
};
