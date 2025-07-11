import express from 'express';

import { 
    createMachineriesUnit,
    addMachineryUnits,
    deleteMachinery,
    deleteMachineryUnits,
    updateMachineryUnit,
    getMachineriesUnits,
    transferMachineriesUnit
} from '../controller/machineries/adminDashboard.controller.js';

import { generateMachineryExcelReport } from '../controller/machineries/genReports.controller.js';

import { verifyAuthToken } from '../middleware/verifyToken.js';
import { verifyRole } from '../middleware/verifyRole.js';

const router = express.Router();

router.post('/add-machinery-unit', verifyAuthToken, verifyRole(['MIS']), createMachineriesUnit);
router.post('/add-machinery-units', verifyAuthToken, verifyRole(['MIS']), addMachineryUnits);
router.delete('/delete-machinery', verifyAuthToken, verifyRole(['MIS']), deleteMachinery);
router.post('/delete-machinery-units', verifyAuthToken, verifyRole(['MIS']), deleteMachineryUnits);
router.post('/update-machinery-unit', verifyAuthToken, verifyRole(['MIS']), updateMachineryUnit);
router.get('/machinery-units', verifyAuthToken, verifyRole(['MIS']), getMachineriesUnits);
router.post('/transfer-machinery-unit', verifyAuthToken, verifyRole(['MIS']), transferMachineriesUnit);
router.get('/generate-machinery-report', verifyAuthToken, verifyRole(['MIS']), generateMachineryExcelReport);

export default router;