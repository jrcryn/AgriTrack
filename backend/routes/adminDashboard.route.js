import express from 'express';
import { getUnvalidatedFarmerInputs, getValidatedFarmerInputs, createFarmerAccount, getFarmerAccounts } from '../controller/adminDashboard.controller.js'; 

const router = express.Router();

router.get('/get-unvalidated-inputs', getUnvalidatedFarmerInputs);
router.get('/get-validated-inputs', getValidatedFarmerInputs);
router.post('/create-farmer-account', createFarmerAccount);
router.get('/get-farmer-accounts', getFarmerAccounts);

export default router;