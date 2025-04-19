import express from 'express';

import { 
    createMachineriesUnit,
    addMachineryUnits,
    deleteMachineryUnit,
    updateMachineryUnit,
    getMachineriesUnits,
    transferMachineriesUnit
} from '../controller/machineries/adminDashboard.controller.js';

const router = express.Router();

router.post('/add-machinery-unit', createMachineriesUnit);
router.post('/add-machinery-units', addMachineryUnits);
router.delete('/delete-machinery-unit', deleteMachineryUnit);
router.post('/update-machinery-unit', updateMachineryUnit);
router.get('/machinery-units', getMachineriesUnits);
router.post('/transfer-machinery-unit', transferMachineriesUnit);

export default router;