import express from 'express';

import { 
    addMachineriesUnit,
    getMachineriesUnits,
    transferMachineriesUnit
} from '../controller/machineries/adminDashboard.controller.js';

const router = express.Router();

router.post('/add-machinery-unit', addMachineriesUnit);
router.get('/machinery-units', getMachineriesUnits);
router.post('/transfer-machinery-unit', transferMachineriesUnit);

export default router;