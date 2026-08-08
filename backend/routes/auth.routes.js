import express from 'express';

import { login, checkAuth, switchRole, logout, generate2FASecret, verify2FA, forgotPassword, resetPassword } from '../controller/authentication/auth.controller.js';
import { verifyPreAuthToken, verifyAuthToken } from '../middleware/verifyToken.js';
import { loginLimiter, forgotPasswordLimiter, verify2FALimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.get('/check-auth', verifyAuthToken, checkAuth);
router.post('/switch-role', verifyAuthToken, switchRole);
router.post('/login', loginLimiter, login); 
router.post('/2fa/generate-2fa-secret', verifyPreAuthToken, (req, res) => res.status(403).json({success: false, message: "Disabled in demo version."}));
router.post('/2fa/verify-2fa', verify2FALimiter, verifyPreAuthToken, (req, res) => res.status(403).json({success: false, message: "Disabled in demo version."}));
router.post('/logout', verifyAuthToken, logout); 
router.post('/forgot-password', forgotPasswordLimiter, (req, res) => res.status(403).json({success: false, message: "Disabled in demo version."}));
router.post('/reset-password/:token', (req, res) => res.status(403).json({success: false, message: "Disabled in demo version."}));

export default router;
