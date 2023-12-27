import { APIGatewayProxyEvent } from 'common-util/aws/ApiGatewayClient';
import { ApiResponse } from 'common-util/ApiResponse';
import { RequestUtil } from 'common-util/RequestUtil';
import { FeedLogsService } from '../../service/feed/FeedLogsService';
import { AuthUtil, Role } from 'common-util/AuthUtil';

export const handler = async (event: APIGatewayProxyEvent) => {
  try {
    AuthUtil.authorizeUser(event, [Role.admin, Role.marketing]);

    const page = RequestUtil.getPageParam(event);
    const name = RequestUtil.getQueryParam(event, 'name', true);
    const title = RequestUtil.getQueryParam(event, 'title', true);
    const feedLogsData = await new FeedLogsService().getFeedLogs(page, name, title);

    return ApiResponse.success(feedLogsData, event);
  } catch (error) {
    return ApiResponse.error(error as Error, event);
  }
};
