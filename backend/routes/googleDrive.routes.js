import express from 'express';

import {
    getAuthUrl,
    handleCallback,
    // uploadFile,
    // createFolder,
    // listFiles,
    // downloadFile,
    // deleteFile
} from '../controller/googleDrive.controller.js';

const router = express.Router();

// OAuth routes (for initial setup)
router.get('/auth', getAuthUrl);
router.get('/drive/callback', handleCallback);

// Protected routes - all logic is in the controller
// router.post('/upload', uploadFile);
// router.post('/create-folder', createFolder);
// router.get('/list-files', listFiles);
// router.get('/download/:fileId', downloadFile);
// router.delete('/delete/:fileId', deleteFile);

export default router;