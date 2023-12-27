import { ErrorUtil } from './ErrorUtil';
import { UnauthorizedError } from './error/UnauthorizedError';
import { SecretManagerClient } from './aws/SecretManagerClient';
import { APIGatewayProxyEvent } from './aws/ApiGatewayClient';

export interface ServiceUser {
  name: string;
  secret: string;
}

export interface User {
  user_id: string;
  email: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  roles: Set<Role>;
}

export enum Role {
  admin = 'admin',
  cs_agent = 'cs_agent',
  cs_chief_manager = 'cs_chief_manager',
  cs_factory = 'cs_factory',
  cs_manager = 'cs_manager',
  cs_supervisor = 'cs_supervisor',
  designer = 'designer',
  designs = 'designs',
  marketing = 'marketing',
  order_admin = 'order_admin',
  products = 'products',
  products_admin = 'products_admin',
  products_assistant_categorization = 'products_assistant_categorization',
  products_assistant_names = 'products_assistant_names',
  products_assistant_previews = 'products_assistant_previews',
  products_assistant_prints = 'products_assistant_prints',
  products_draft = 'products_draft',
  products_file = 'products_file',
  products_supervisor = 'products_supervisor',
  products_team_categorization = 'products_team_categorization',
  products_team_names = 'products_team_names',
  products_team_previews = 'products_team_previews',
  products_team_prints = 'products_team_prints',
  publisher = 'publisher',
  refund_reports = 'refund_reports',
  shipping = 'shipping',
  storage = 'storage',
}

interface Claims {
  'cognito:username'?: string;
  'cognito:groups'?: string;
  email?: string;
  preferred_username?: string;
  given_name?: string;
  family_name?: string;
}

export type Headers = { [name: string]: string | undefined };

export class AuthUtil {

  public static readonly AUTH_HEADER = 'Authorization';
  public static readonly SERVICE_AUTH_HEADER = 'x-service-auth';

  public static parseUser(event: APIGatewayProxyEvent): User {
    const claims = event && event.requestContext && event.requestContext.authorizer && 'claims' in event.requestContext.authorizer
      ? event.requestContext.authorizer['claims'] as Claims
      : {};

    const roles: Set<Role> = new Set<Role>();
    for (const group of (claims['cognito:groups'] || '').split(',')) {
      roles.add(group.trim() as Role);
    }

    const user_id = claims['cognito:username'];
    const email = claims.email;
    if (!user_id || !email) {
      throw ErrorUtil.missingParams('Some of the required claims are missing', ['UserId', 'Email']);
    }

    return {
      user_id,
      email,
      username: claims.preferred_username,
      roles,
      first_name: claims.given_name,
      last_name: claims.family_name,
    };
  }

  public static hasPermission(user: User, roles: Role[] = []): void {
    if (roles.length) {
      if (user && user.roles) {
        if (!roles.map(role => user.roles.has(role)).reduce((a, b) => a || b, false)) {
          throw ErrorUtil.unauthorized(roles);
        }
      } else {
        throw  ErrorUtil.unauthorized(roles);
      }
    }
  }

  public static authorizeUser(event: APIGatewayProxyEvent, roles?: Role[]): User {
    const user = this.parseUser(event);

    this.hasPermission(user, roles);

    return user;
  }

  public static parseServiceUser(headers: Headers | undefined | null): ServiceUser {
    const authorizationHeader = headers ? headers[AuthUtil.SERVICE_AUTH_HEADER] : '';
    let user: ServiceUser | null = null;

    try {
      if (authorizationHeader) {
        const authorization = new Buffer(authorizationHeader, 'base64').toString('utf8');
        const credentials = authorization.split(':');
        if (credentials.length == 2) {
          const name = credentials[0];
          const secret = credentials[1];

          user = {
            name,
            secret,
          };
        }
      }
    } catch (e) {
      const error = <Error>e;
      throw new UnauthorizedError('Service auth claims parse failed', error, error.message);
    }

    if (!user) {
      throw ErrorUtil.missingParams('Service authentication claims are missing', ['Name', 'Secret']);
    }

    return user;
  }

  public static async prepareServiceUserAuth(secretId: string): Promise<string> {
    const credentials = await SecretManagerClient.getCredentials(secretId);

    return new Buffer(`${credentials.user}:${credentials.pass}`).toString('base64');
  }

  public static async hasServicePermission(user: ServiceUser, secretId: string): Promise<void> {
    const secret = await SecretManagerClient.getCredentials(secretId);

    if (!user || secret.user !== user.name || secret.pass !== user.secret) {
      throw new UnauthorizedError(`User ${user.name} provided incorrect authorization data`);
    }
  }

}
