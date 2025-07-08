import express from 'express';

import { register, login, checkAuth, logout, generate2FASecret, verify2FA, forgotPassword, resetPassword } from '../controller/authentication/auth.controller.js';
import { verifyToken } from '../middleware/verifyToken.js';

const router = express.Router();

router.post('/register', register); // ililipat in the future to a separate route for admin job controllers

router.get('/check-auth', verifyToken, checkAuth);
router.post('/login', login);
router.post('/2fa/generate-2fa-secret', generate2FASecret);
router.post('/2fa/verify-2fa', verify2FA);
router.post('/logout', logout); 
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

export default router;
