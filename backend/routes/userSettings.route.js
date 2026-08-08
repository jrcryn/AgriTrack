import express from 'express';

const router = express.Router();

import { changeUserPassword, get2FAsecret } from '../controller/userSettings/userSettings.controller.js';
import { verifyAuthToken } from '../middleware/verifyToken.js';

router.post('/change-user-password', verifyAuthToken, (req, res) => res.status(403).json({success: false, message: "Disabled in demo version."}));
router.post('/fetch-2fa-secret', verifyAuthToken, (req, res) => res.status(403).json({success: false, message: "Disabled in demo version."}));

export default router;