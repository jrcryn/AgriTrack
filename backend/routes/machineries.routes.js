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

const router = express.Router();

router.post('/add-machinery-unit', createMachineriesUnit);
router.post('/add-machinery-units', addMachineryUnits);
router.delete('/delete-machinery', deleteMachinery);
router.post('/delete-machinery-units', deleteMachineryUnits);
router.post('/update-machinery-unit', updateMachineryUnit);
router.get('/machinery-units', getMachineriesUnits);
router.post('/transfer-machinery-unit', transferMachineriesUnit);

router.get('/generate-machinery-report', generateMachineryExcelReport);

export default router;