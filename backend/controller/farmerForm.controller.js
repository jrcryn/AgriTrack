import  A_farmer_inputs from '../models/A_farmerInputs.model.js';
import  B_crop_types  from '../models/B_cropTypes.model.js';
import  C_crop_records_indus  from '../models/C1_cropRecordsIndus.model.js';
import  C_crop_records_others  from '../models/C2_cropRecordsOthers.model.js';
import  D1_crop_indus_new  from '../models/D1_cropIndusNew.model.js';
import  D1_crop_indus_harvest  from '../models/D1_cropIndusHarvest.model.js';
import  D2_bc_other_fct_new  from '../models/D2_bc-other-fctNew.model.js';
import  D2_bc_other_fct_harvest  from '../models/D2_bc-other-fctHarvest.model.js';

// Step 1: Create a new record input in the A_farmer_inputs collection

export const formA_fi = async (req, res) => {
    try {
      const newFarmerInput = await A_farmer_inputs.create({
        surname: req.body.surname,
        first_name: req.body.first_name,
        middle_name: req.body.middle_name,
        suffix: req.body.suffix,
        farm_location: req.body.farm_location,
      });
      return res.json(newFarmerInput);
    } catch (error) {
      return res.status(500).json({ message: 'Error creating farmer input', error });
    }
  };

// Step 2: After ng farmer detail, dito na pipili ng type of crop na itatanim (Referencing A_farmer_inputs)

export const formB_ct = async (req, res) => {
    try {
      const newCropType = await B_crop_types.create({
        farmer_input_id: req.body.farmer_input_id,
        crop_type: req.body.crop_type,
      });
      return res.json(newCropType);
    } catch (error) {
      return res.status(500).json({ message: 'Error creating crop type', error });
    }
  };

// Step 3: If selected INDUSTRIAL CROP para sa type of crop, ito na ang next form na pupuntahan

export const formC1_cri = async (req, res) => {
    try {
      const newIndusRecord = await C_crop_records_indus.create({
        farmer_input_id: req.body.farmer_input_id,
        crop_type_id: req.body.crop_type_id,
        crop_type: req.body.crop_type,
        crop_variety: req.body.crop_variety,
        crop_stage: req.body.crop_stage,
      });
      return res.json(newIndusRecord);
    } catch (error) {
      return res.status(500).json({ message: 'Error creating indus record', error });
    }
  };

// Step 3A: If selected BANANA, COFFEE or OTHERS para sa type of crop, ito next form na pupuntahan

export const formC2_cro = async (req, res) => {
    try {
      const newOthersRecord = await C_crop_records_others.create({
        farmer_input_id: req.body.farmer_input_id,
        crop_type_id: req.body.crop_type_id,
        crop_variety: req.body.crop_variety,
        crop_stage: req.body.crop_stage,
      });
      return res.json(newOthersRecord);
    } catch (error) {
      return res.status(500).json({ message: 'Error creating others record', error });
    }
  }

// Step 4A: If selected INDUSTRIAL CROP and HARVESTING ang stage, ito next form na pupuntahan

export const formD1_cih = async (req, res) => {
    try {
      const newIndusHarvest = await D1_crop_indus_harvest.create({
        record_id: req.body.record_id,
        harvest_date: req.body.harvest_date,
        total_area_harvested: req.body.total_area_harvested,
        total_weight: req.body.total_weight,
        destination: req.body.destination,
        mode_of_payment: req.body.mode_of_payment,
        mode_of_delivery: req.body.mode_of_delivery,
      });
      return res.json(newIndusHarvest);
    } catch (error) {
      return res.status(500).json({ message: 'Error creating indus harvest', error });
    }
  };

// Step 4A: If selected INDUSTRIAL CROP pero NEWLY PLANTED and stage, to pupuntahan

export const formD1_cin = async (req, res) => {
    try {
      const newIndusNew = await D1_crop_indus_new.create({
        record_id: req.body.record_id,
        plantation_date: req.body.plantation_date,
        harvest_month_year: req.body.harvest_month,
        total_area_planted: req.body.total_area_planted,
      });
      return res.json(newIndusNew);
    } catch (error) {
      return res.status(500).json({ message: 'Error creating indus new', error });
    }
  };

// Step 4B: If selected BANANA, COFFEE or OTHERS and HARVESTING ang stage, ito next form na pupuntahan

export const formD2_bc_ofh = async (req, res) => {
    try {
      const newOthersHarvest = await D2_bc_other_fct_harvest.create({
        record_id: req.body.record_id,
        harvest_date: req.body.harvest_date,
        trees_harvested: req.body.trees_harvested,
        total_weight: req.body.total_weight,
        destination: req.body.destination,
        mode_of_payment: req.body.mode_of_payment,
        mode_of_delivery: req.body.mode_of_delivery,
      });
      return res.json(newOthersHarvest);
    } catch (error) {
      return res.status(500).json({ message: 'Error creating others harvest', error });
    }
  }

// Step 4B: If selected BANANA, COFFEE or OTHERS pero NEWLY PLANTED ang stage, ito next na pupuntahan

export const formD2_bc_ofn = async (req, res) => {
    try {
      const newOthersNew = await D2_bc_other_fct_new.create({
        record_id: req.body.record_id,
        harvest_month_year: req.body.harvest_month,
        total_trees: req.body.total_trees,
      });
      return res.json(newOthersNew);
    } catch (error) {
      return res.status(500).json({ message: 'Error creating others new', error });
    }
  }



