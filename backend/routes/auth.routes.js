import express from 'express';

import { register, login, logout, generate2FASecret } from '../controller/authentication/auth.controller.js';

const router = express.Router();

router.post('/register', register); 
router.post('/login', login);
router.post('/generate-2fa-secret', generate2FASecret);
router.post('/logout', logout); 

export default router;
