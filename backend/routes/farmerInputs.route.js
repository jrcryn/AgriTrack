const express = require('express');
const router = express.Router();
const { A_farmer_inputs } = require('../models');

router.post('/farmer-inputs', async (req, res) => {
    const farmerInput = req.body;
    try {
        await A_farmer_inputs.create(farmerInput); 
        res.status(201).json(farmerInput);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.get('/farmer-inputs', async (req, res) => {
    res.json('The quick brown fox jumps over the lazy dog.');
});

module.exports = router;