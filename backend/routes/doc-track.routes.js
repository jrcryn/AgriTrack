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
    getDocumentHistory,
    getDocumentStatus,
    getOutgoingForwardedDocuments,
    getArchivedDocuments,
    getReleasedDocuments,
    rerouteDocument,
    unarchiveDocument,
    unreleaseDocument,
    getUsersDocumentWorkload
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
router.get('/get-document-history/:id', getDocumentHistory);
router.get('/get-outgoing-forwarded-documents/:id', getOutgoingForwardedDocuments); 
router.get('/get-archived-documents', getArchivedDocuments);
router.get('/get-released-documents', getReleasedDocuments);

router.post('/get-document-status', getDocumentStatus);

router.post('/reroute-document', rerouteDocument);
router.post('/unarchive-document', unarchiveDocument);
router.post('/unrelease-document', unreleaseDocument);

router.get('/doc-track/users-workload', getUsersDocumentWorkload);

export default router;

