import { getDocTrackDB } from '../../config/dbAccessHelper.js';

import { DocumentSchema } from './schemas/document.schema.js';
import { DocumentDetailSchema } from './schemas/documentDetail.schema.js';
import { QrCodeSchema } from './schemas/qrCode.schema.js';
import { StaffSchema } from './schemas/staffAccount.schema.js';
import { AdminSchema } from './schemas/adminAccount.schema.js';

export const initializeDocTrackModels = () => {
    const db = getDocTrackDB();

    return {
        Document: db.model('Document', DocumentSchema),
        DocumentDetail: db.model('DocumentDetail', DocumentDetailSchema),
        QrCode: db.model('QrCode', QrCodeSchema),
        Staff: db.model('Staff', StaffSchema),
        Admin: db.model('Admin', AdminSchema),
    };
};