import express from 'express';

import { login, checkAuth, switchRole, logout, generate2FASecret, verify2FA, forgotPassword, resetPassword } from '../controller/authentication/auth.controller.js';
import { verifyPreAuthToken, verifyAuthToken } from '../middleware/verifyToken.js';
import { loginLimiter, forgotPasswordLimiter, verify2FALimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.get('/check-auth', verifyAuthToken, checkAuth);
router.post('/switch-role', verifyAuthToken, switchRole);
router.post('/login', loginLimiter, login); 
router.post('/2fa/generate-2fa-secret', verifyPreAuthToken, generate2FASecret);
router.post('/2fa/verify-2fa', verify2FALimiter, verifyPreAuthToken, verify2FA);
router.post('/logout', verifyAuthToken, logout); 
router.post('/forgot-password', forgotPasswordLimiter, forgotPassword);
router.post('/reset-password/:token', resetPassword);

export default router;
