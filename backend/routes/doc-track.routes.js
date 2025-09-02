import express from 'express';

import { 
    createDocument,
    registerDocument,
    forwardDocument,
    receiveDocument,
    archiveDocument,
    releaseDocument,
 } from '../controller/doc-track/adminDashboard.controller.js';

const router = express.Router();

router.post('/create-document', createDocument);
router.post('/register-document', registerDocument);
router.post('/forward-document', forwardDocument);
router.post('/receive-document', receiveDocument);
router.post('/archive-document', archiveDocument);
router.post('/release-document', releaseDocument);

export default router;

