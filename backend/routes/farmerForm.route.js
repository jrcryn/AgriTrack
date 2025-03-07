import express from 'express';
import {
    formA_fi,
    formB_ct,
    formC1_cri,
    formC2_cro,
    formD1_cih,
    formD1_cin,
    formD2_bc_ofh,
    formD2_bc_ofn
} from '../controller/farmerForm.controller.js';

const router = express.Router();

router.post('/farmerForm-a', formA_fi);
router.post('/farmerForm-b', formB_ct);
router.post('/farmerForm-c1-cri', formC1_cri);
router.post('/farmerForm-c1-cro', formC2_cro);
router.post('/farmerForm-d1-cih', formD1_cih);
router.post('/farmerForm-d1-cin', formD1_cin);
router.post('/farmerForm-d2-bc-ofh', formD2_bc_ofh);
router.post('/farmerForm-d2-bc-ofn', formD2_bc_ofn);

export default router;