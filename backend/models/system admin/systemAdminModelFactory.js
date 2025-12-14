import { getSystemAdminDB } from '../../config/dbAccessHelper.js';
import { SystemAdminAccountSchema } from './schemas/systemAdminAccount.schema.js';

export const initializeSystemAdminModels = () => {
    const db = getSystemAdminDB();

    return {
        SystemAdminAccount: db.model('SystemAdminAccount', SystemAdminAccountSchema)
    };
};