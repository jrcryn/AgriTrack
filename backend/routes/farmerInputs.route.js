import express from 'express';
const router = express.Router();
import A_farmer_inputs from '../models/A_farmerInputs.model.js';

router.post('/farmer-inputs', async (req, res) => {
    const farmerInput = new A_farmer_inputs(req.body);
    await farmerInput.save();
    res.json(farmerInput);
});

router.get('/farmer-inputs', async (req, res) => {
    res.json('The quick brown fox jumps over the lazy dog.');
});

export default router;