import express from 'express';

import { 
    createDocument,
    registerDocument,
    downloadQrCode,
    forwardDocument,
    receiveDocument,
    archiveDocument,
    releaseDocument,
    getIncomingForwardedDocuments,
    getPendingDocuments,
    getDocumentTypes
 } from '../controller/doc-track/adminDashboard.controller.js';

const router = express.Router();

router.post('/create-document', createDocument);
router.post('/register-document', registerDocument);
router.get('/download-qr-code/:id', downloadQrCode);
router.post('/forward-document', forwardDocument);
router.post('/receive-document', receiveDocument);
router.post('/archive-document', archiveDocument);
router.post('/release-document', releaseDocument);

router.get('/get-incoming-forwarded-documents/:id', getIncomingForwardedDocuments);
router.get('/get-pending-documents/:id', getPendingDocuments);

router.get('/get-document-types', getDocumentTypes);

export default router;

