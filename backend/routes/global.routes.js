import express from 'express';

const router = express.Router();

import { getFarmerAccountByName } from '../controller/global/global.controller.js';

router.post('/get-farmer-account-by-name', getFarmerAccountByName);

export default router;