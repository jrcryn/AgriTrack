import express from 'express';

import { createDocument, downloadQrCode } from '../controller/doc-track/adminDashboard.controller.js';

const router = express.Router();

router.post('/create-document', createDocument);
router.get('/documents/:id/qrcode', downloadQrCode);

export default router;

