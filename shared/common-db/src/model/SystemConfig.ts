import { DBObjectId } from '../service/DBService';

export interface SystemConfigEntity {
  _id: DBObjectId;
  key: string;
  value: string;
  format: string;
  type: string;
}
