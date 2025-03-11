import express from 'express';
import { getAllFarmerInputs, updateFarmerInput } from '../controller/adminDashboard.controller.js'; 

const router = express.Router();

router.get('/get-farmerInputs', getAllFarmerInputs);
router.put('/update-farmerInput', updateFarmerInput);

export default router;