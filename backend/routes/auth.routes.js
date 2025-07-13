import express from 'express';

import { register, login, checkAuth, logout, generate2FASecret, verify2FA, forgotPassword, resetPassword } from '../controller/authentication/auth.controller.js';
import { verifyPreAuthToken, verifyAuthToken } from '../middleware/verifyToken.js';
import { loginLimiter, forgotPasswordLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/register', register); // ililipat in the future to a separate route for admin job controllers

router.get('/check-auth', verifyAuthToken, checkAuth);
router.post('/login', loginLimiter, login);
router.post('/2fa/generate-2fa-secret', loginLimiter, verifyPreAuthToken, generate2FASecret);
router.post('/2fa/verify-2fa', loginLimiter, verifyPreAuthToken, verify2FA);
router.post('/logout', logout); 
router.post('/forgot-password', forgotPasswordLimiter, forgotPassword);
router.post('/reset-password/:token', resetPassword);

export default router;
