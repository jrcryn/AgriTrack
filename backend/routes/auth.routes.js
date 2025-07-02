import express from 'express';

import { register, login, logout, generate2FASecret, verify2FA } from '../controller/authentication/auth.controller.js';

const router = express.Router();

router.post('/register', register); // ililipat in the future to a separate route for admin job controllers
router.post('/login', login);
router.post('/2fa/generate-2fa-secret', generate2FASecret);
router.post('/2fa/verify-2fa', verify2FA);
router.post('/logout', logout); 

export default router;
