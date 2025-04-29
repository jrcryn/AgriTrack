import express from 'express';

import { createStaffAccount } from '../controller/doc-track/adminDashboard.controller.js';

const router = express.Router();

router.post('/create-doctrack-staff-account', createStaffAccount);

export default router;