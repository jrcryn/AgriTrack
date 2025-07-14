import express from 'express';

const router = express.Router();

import { changeUserPassword, get2FAsecret } from '../controller/userSettings/userSettings.controller.js';
import { verifyAuthToken } from '../middleware/verifyToken.js';

router.post('/change-user-password', verifyAuthToken, changeUserPassword);
router.post('/fetch-2fa-secret', verifyAuthToken, get2FAsecret);

export default router;