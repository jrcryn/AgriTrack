import express from 'express';

import { 
    createMachineriesUnit,
    addMachineryUnits,
    deleteMachinery,
    deleteMachineryUnits,
    //updateMachineryUnit,
    getMachineriesUnits,
    transferMachineriesUnit,



    createTicketRequestForm,
    createMachineriesType,
    updateMachineryType,
    addMachineryUnit,
    updateMachineryUnit,
    createWeeklySchedule,
    removeTicketRequestFromSchedule,
    moveTicketRequestToASchedule,
    formGetAvailableMachineryTypes,
    getMachineryTypes,
    getPendingTicketRequests,
    getMachineryUnits
} from '../controller/machineries/adminDashboard.controller.js';

import { generateMachineryExcelReport } from '../controller/machineries/genReports.controller.js';

import { verifyAuthToken } from '../middleware/verifyToken.js';
import { verifyRole } from '../middleware/verifyRole.js';

const router = express.Router();

// Machinery unit management routes
router.post('/add-machinery-unit', verifyAuthToken, verifyRole(['MIM', 'MIS']), createMachineriesUnit);
router.post('/add-machinery-units', verifyAuthToken, verifyRole(['MIM', 'MIS']), addMachineryUnits);
router.delete('/delete-machinery', verifyAuthToken, verifyRole(['MIM', 'MIS']), deleteMachinery);
router.post('/delete-machinery-units', verifyAuthToken, verifyRole(['MIM', 'MIS']), deleteMachineryUnits);
router.get('/machinery-units', verifyAuthToken, verifyRole(['MIM', 'MIS']), getMachineriesUnits);
router.post('/transfer-machinery-unit', verifyAuthToken, verifyRole(['MIM', 'MIS']), transferMachineriesUnit);
router.get('/generate-machinery-report', verifyAuthToken, verifyRole(['MIM', 'MIS']), generateMachineryExcelReport);




router.post('/create-machinery-type', createMachineriesType); //working
router.put('/update-machinery-type', updateMachineryType);
router.get('/get-machinery-types', getMachineryTypes);

router.post('/create-machinery-unit', addMachineryUnit); //working
router.post('/update-machinery-unit', updateMachineryUnit);
router.post('/get-machinery-unit', getMachineryUnits);

router.get('/get-pending-ticket-requests', getPendingTicketRequests);

router.post('/create-weekly-schedule', createWeeklySchedule); //working
router.post('/remove-from-schedule/:ticketRequestId', removeTicketRequestFromSchedule); //working
router.post('/move-to-schedule', moveTicketRequestToASchedule);  // FOR REVIEW


// Public API routes
router.get('/get-available-machinery-types', formGetAvailableMachineryTypes); //working
router.post('/create-ticket-request', createTicketRequestForm); //working

export default router;