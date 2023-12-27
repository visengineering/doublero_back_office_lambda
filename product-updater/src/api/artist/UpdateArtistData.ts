import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'common-util/aws/ApiGatewayClient';
import { ApiResponse } from 'common-util/ApiResponse';
import { ArtistUpdateService } from '../../service/artist/ArtistUpdateService';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log(`Got artist update request: ${JSON.stringify(event)}`);

  await ArtistUpdateService.handleArtistUpdate();

  return ApiResponse.success({}, event);
};
