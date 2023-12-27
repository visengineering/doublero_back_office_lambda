import { ErrorUtil } from 'common-util/ErrorUtil';
import { PgClientService, PgQueryResultRow } from './PgClientService';

export abstract class PgDatabaseBaseService {

    protected static async query<TEntity extends PgQueryResultRow>(query: string): Promise<TEntity[]> {
        try {
            const client = await PgClientService.getClient();
            const { rows } = await client.query<TEntity>(query);
            return rows;
        } catch (e) {
            const error = e as Error;
            throw ErrorUtil.communication(`Error while querying database: ${error.message}`, error);
        }
    }

    protected static getPaginationQueryPart(page: number, pageSize: number): string {
        const offset = (page - 1) * pageSize;
        return `OFFSET ${offset} LIMIT ${pageSize}`;
    }
}