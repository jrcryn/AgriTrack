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

import { verifyToken } from '../middleware/verifyToken.js';
import { verifyRole } from '../middleware/verifyRole.js';

const router = express.Router();

router.post('/add-machinery-unit', verifyToken, verifyRole(['MIS']), createMachineriesUnit);
router.post('/add-machinery-units', verifyToken, verifyRole(['MIS']), addMachineryUnits);
router.delete('/delete-machinery', verifyToken, verifyRole(['MIS']), deleteMachinery);
router.post('/delete-machinery-units', verifyToken, verifyRole(['MIS']), deleteMachineryUnits);
router.post('/update-machinery-unit', verifyToken, verifyRole(['MIS']), updateMachineryUnit);
router.get('/machinery-units', verifyToken, verifyRole(['MIS']), getMachineriesUnits);
router.post('/transfer-machinery-unit', verifyToken, verifyRole(['MIS']), transferMachineriesUnit);
router.get('/generate-machinery-report', verifyToken, verifyRole(['MIS']), generateMachineryExcelReport);

export default router;