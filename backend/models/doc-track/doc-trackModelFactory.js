import { getDocTrackDB } from '../../config/dbAccessHelper.js';

import { DocumentSchema } from './schemas/document.schema.js';
import { DocumentDetailSchema } from './schemas/documentDetail.schema.js';
import { QrCodeSchema } from './schemas/qrCode.schema.js';
import { StaffSchema } from './schemas/staffAccount.schema.js';
import { ManagerSchema } from './schemas/managerAccount.schema.js';

export const initializeDocTrackModels = () => {
    const db = getDocTrackDB();

    return {
        Document: db.model('Document', DocumentSchema),
        Document_Detail: db.model('Document_Detail', DocumentDetailSchema),
        QrCode: db.model('QrCode', QrCodeSchema),
        StaffAccount: db.model('Staff_Account', StaffSchema),
        ManagerAccount: db.model('Manager_Account', ManagerSchema),
    };
};