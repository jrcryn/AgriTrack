import express from 'express';

import { 
    createDocument,
    updateDocumentType,
    registerDocument,
    downloadQrCode,
    forwardDocument,
    receiveDocument,
    archiveDocument,
    releaseDocument,
    getIncomingForwardedDocuments,
    getPendingDocuments,
    getDocumentTypes,
    getDocumentHistory,
    getDocumentStatus
 } from '../controller/doc-track/adminDashboard.controller.js';

const router = express.Router();

router.post('/create-document', createDocument);
router.post('/update-document-type', updateDocumentType);
router.post('/register-document', registerDocument);
router.get('/download-qr-code/:id', downloadQrCode);
router.post('/forward-document', forwardDocument);
router.post('/receive-document', receiveDocument);
router.post('/archive-document', archiveDocument);
router.post('/release-document', releaseDocument);

router.get('/get-incoming-forwarded-documents/:id', getIncomingForwardedDocuments);
router.get('/get-pending-documents/:id', getPendingDocuments);

router.get('/get-document-types', getDocumentTypes);
router.get('/get-document-history/:id', getDocumentHistory);

router.get('/get-document-status/:refNum', getDocumentStatus)

export default router;

