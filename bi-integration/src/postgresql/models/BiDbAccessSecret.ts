import { ErrorUtil } from 'common-util/ErrorUtil';
import { ValidationUtil } from 'common-util/ValidationUtil';

export class BiDbAccessSecret {
    readonly host?: string;
    readonly port?: number;
    readonly username?: string;
    readonly password?: string;
    readonly dbname?: string;

    validate() {
        try {
            ValidationUtil.validateString('host', this.host, ValidationUtil.stringFormat());
            ValidationUtil.validateNumber('port', this.port, ValidationUtil.numberFormat(0, 65353, true));
            ValidationUtil.validateString('username', this.username, ValidationUtil.stringFormat());
            ValidationUtil.validateString('password', this.password, ValidationUtil.stringFormat());
            ValidationUtil.validateString('dbname', this.dbname, ValidationUtil.stringFormat());
        } catch (e) {
            const error = e as Error;
            throw ErrorUtil.badRequest(`Invalid values in ${BiDbAccessSecret.name}: ${error.message}`, error);
        }
    }
}