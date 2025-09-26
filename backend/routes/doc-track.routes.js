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

const router = express.Router();

router.post('/create-document', createDocument);
router.post('/update-document-type', updateDocumentType);
router.post('/register-document', registerDocument);
router.get('/download-qr-code/:id', downloadQrCode);
router.post('/forward-document', forwardDocument);
router.post('/register-forward-document', registerAndForwardDocument);
router.post('/receive-document', receiveDocument);
router.post('/archive-document', archiveDocument);
router.post('/release-document', releaseDocument);

router.get('/get-admin-staff-accounts/:id', getAdminAndStaffAccounts);

router.get('/get-incoming-forwarded-documents/:id', getIncomingForwardedDocuments);
router.get('/get-pending-documents/:id', getPendingDocuments);

router.get('/get-document-types', getDocumentTypes);
//router.get('/get-document-history/:id', getDocumentHistory);
router.get('/get-outgoing-forwarded-documents/:id', getOutgoingForwardedDocuments); 
router.get('/get-archived-documents', getArchivedDocuments);


router.post('/get-document-status', getDocumentStatus);

router.post('/reroute-document', rerouteDocument);
router.post('/unarchive-document', unarchiveDocument);
router.post('/unrelease-document', unreleaseDocument);

router.get('/users-workload', getUsersDocumentWorkload);

router.get('/get-total-incoming-documents', getTotalIncomingDocuments);
router.get('/get-released-documents', getReleasedDocuments);
router.get('/get-expired-documents', getExpiredDocuments);
router.get('/get-disposed-documents', getDisposedDocuments);

router.post('/dispose-documents', disposeDocuments);
router.post('/delete-registered-document/:id', deleteRegisteredDocument);

router.get('/get-section-document-count', getSectionDocumentCount)

export default router;

