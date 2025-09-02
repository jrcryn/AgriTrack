import { getDocTrackDB } from '../../config/dbAccessHelper.js';

//import { DocumentSchema } from './schemas/document.schema.js';
import { DocumentSchema } from './schemas/document.schema.js';
import { DocumentLifeCycleSchema } from './schemas/documentLifeCycle.schema.js';
import { DocTrackStaffSchema } from './schemas/docTrackStaffAccount.schema.js';
import { DocTrackManagerSchema } from './schemas/docTrackManagerAccount.schema.js';
import { CounterSchema } from './schemas/counter.schema.js';
import { ArchivedDocumentsSchema } from './schemas/archivedDocuments.schema.js'
import { ReleasedDocumentsSchema } from './schemas/releasedDocuments.schema.js'

export const initializeDocTrackModels = () => {
    const db = getDocTrackDB();

    return {
        Document: db.model('Document', DocumentSchema),
        DocumentLifeCycle: db.model('Document_Life_Cycle', DocumentLifeCycleSchema),
        StaffAccount: db.model('Staff_Account', DocTrackStaffSchema),
        ManagerAccount: db.model('Manager_Account', DocTrackManagerSchema),
        Counter: db.model('Counter', CounterSchema),
        ArchivedDocuments: db.model('Archived_Documents', ArchivedDocumentsSchema),
        ReleasedDocuments: db.model('Released_Documents', ReleasedDocumentsSchema)
    };
};