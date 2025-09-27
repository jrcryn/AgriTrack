import express from 'express';

import { 
    createDocument,
    updateDocumentType,
    registerDocument,
    downloadQrCode,
    forwardDocument,
    registerAndForwardDocument,
    receiveDocument,
    archiveDocument,
    releaseDocument,
    getAdminAndStaffAccounts,
    getIncomingForwardedDocuments,
    getPendingDocuments,
    getDocumentTypes,
    //getDocumentHistory,
    getDocumentStatus,
    getOutgoingForwardedDocuments,
    getArchivedDocuments,
    getReleasedDocuments,
    rerouteDocument,
    unarchiveDocument,
    unreleaseDocument,
    getUsersDocumentWorkload,
    getTotalIncomingDocuments,
    getExpiredDocuments,
    disposeDocuments,
    deleteRegisteredDocument,
    getSectionDocumentCount,
    getDisposedDocuments
 } from '../controller/doc-track/adminDashboard.controller.js';

import { verifyAuthToken } from '../middleware/verifyToken.js';
import { verifyRole } from '../middleware/verifyRole.js';

const router = express.Router();

router.post('/create-document', verifyAuthToken, verifyRole(['DMM']), createDocument);
router.post('/update-document-type', verifyAuthToken, verifyRole(['DMM']), updateDocumentType);
router.post('/register-document', verifyAuthToken, verifyRole(['DMM']),  registerDocument);
router.get('/download-qr-code/:id', verifyAuthToken, verifyRole(['DMM']), downloadQrCode);
router.post('/forward-document', verifyAuthToken, verifyRole(['DMM', 'DMS']), forwardDocument);
router.post('/register-forward-document', verifyAuthToken, verifyRole(['DMM', 'DMS']), registerAndForwardDocument);
router.post('/receive-document', verifyAuthToken, verifyRole(['DMM', 'DMS']), receiveDocument);
router.post('/archive-document', verifyAuthToken, verifyRole(['DMM', 'DMS']), archiveDocument);
router.post('/release-document', verifyAuthToken, verifyRole(['DMM', 'DMS']), releaseDocument);

router.get('/get-admin-staff-accounts/:id', verifyAuthToken, verifyRole(['DMM']), getAdminAndStaffAccounts);

router.get('/get-incoming-forwarded-documents/:id', verifyAuthToken, verifyRole(['DMM', 'DMS']), getIncomingForwardedDocuments);
router.get('/get-pending-documents/:id', verifyAuthToken, verifyRole(['DMM', 'DMS']), getPendingDocuments);
router.get('/get-outgoing-forwarded-documents/:id', verifyAuthToken, verifyRole(['DMM', 'DMS']), getOutgoingForwardedDocuments); 

router.get('/get-document-types', verifyAuthToken, verifyRole(['DMM']), getDocumentTypes);


router.get('/get-archived-documents', verifyAuthToken, verifyRole(['DMM']), getArchivedDocuments);


router.post('/get-document-status', verifyAuthToken, verifyRole(['DMM', 'DMS']), getDocumentStatus);

router.post('/reroute-document', verifyAuthToken, verifyRole(['DMM']), rerouteDocument);
router.post('/unarchive-document', verifyAuthToken, verifyRole(['DMM']), unarchiveDocument);
router.post('/unrelease-document', verifyAuthToken, verifyRole(['DMM']),  unreleaseDocument);

router.get('/users-workload', verifyAuthToken, verifyRole(['DMM']), getUsersDocumentWorkload);

router.get('/get-total-incoming-documents', verifyAuthToken, verifyRole(['DMM']), getTotalIncomingDocuments);
router.get('/get-released-documents', verifyAuthToken, verifyRole(['DMM']), getReleasedDocuments);
router.get('/get-expired-documents', verifyAuthToken, verifyRole(['DMM']), getExpiredDocuments);
router.get('/get-disposed-documents', verifyAuthToken, verifyRole(['DMM']), getDisposedDocuments);

router.post('/dispose-documents', verifyAuthToken, verifyRole(['DMM']), disposeDocuments);
router.post('/delete-registered-document/:id', verifyAuthToken, verifyRole(['DMM']), deleteRegisteredDocument);

router.get('/get-section-document-count', verifyAuthToken, verifyRole(['DMM']), getSectionDocumentCount)

export default router;

