import { SecretManagerClient } from 'common-util/aws/SecretManagerClient';
import { ErrorUtil } from 'common-util/ErrorUtil';
import { RequestUtil } from 'common-util/RequestUtil';
import { Client, QueryResult, QueryResultRow, types } from 'pg';
import { BiDbAccessSecret } from './models/BiDbAccessSecret';

export type PgClient = Client;
export type PgQueryResultRow = QueryResultRow;
export type PgQueryResult = QueryResult;

export const BI_DB_ACCESS_SECRET = 'BI_DB_ACCESS_SECRET';

export class PgClientService {
    private static instance: PgClientService;

    private client: PgClient;
    private clientPromise: Promise<void>;

    private constructor() {
        this.setTypeParsers();
        this.clientPromise = this.initConnection();
    }

    public static async getClient(): Promise<PgClient> {
        if (!PgClientService.instance) {
            PgClientService.instance = new PgClientService();
        }

        try {
            await PgClientService.instance.clientPromise;
        } catch (e) {
            const error = e as Error;
            throw ErrorUtil.communication(`DB connection was not established: ${error.message}`, error);
        }

        return PgClientService.instance.client;
    }

    private async getDbAccessSecret(): Promise<BiDbAccessSecret> {
        const secretId = RequestUtil.getEnvParam(BI_DB_ACCESS_SECRET);
        const dbSecret = await SecretManagerClient.getSecretValue(secretId);
        let accessSecret: BiDbAccessSecret;

        try {
            accessSecret = Object.assign(new BiDbAccessSecret(), JSON.parse(dbSecret));
        } catch (e) {
            const error = e as Error;
            throw ErrorUtil.configuration(`Error while parsing secret for accessing database: ${error.message}`, [BI_DB_ACCESS_SECRET]);
        }

        accessSecret.validate();

        return accessSecret;
    }

    private async createClient(): Promise<PgClient> {
        const accessSecret = await this.getDbAccessSecret();

        return new Client({
            host: accessSecret.host,
            password: accessSecret.password,
            user: accessSecret.username,
            database: accessSecret.dbname,
            port: accessSecret.port,
            ssl: true
        });
    }

    private async initConnection(): Promise<void> {
        if (!this.client) this.client = await this.createClient();

        try {
            await this.client.connect();
        } catch (e) {
            const error = e as Error;
            throw ErrorUtil.communication(`Error while connecting to database: ${error.message}`);
        }
    }

    private setTypeParsers() {
        const numericParser = (value: string) => {
            if (value === null || undefined) return null;
            if (!isNaN(parseFloat(value))) return parseFloat(value);
            return value;
        };

        types.setTypeParser(types.builtins.NUMERIC, numericParser);
        types.setTypeParser(types.builtins.INT2, numericParser);
        types.setTypeParser(types.builtins.INT4, numericParser);
        types.setTypeParser(types.builtins.INT8, numericParser);
    }
}
