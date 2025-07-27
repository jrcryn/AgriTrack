import mongoose from 'mongoose';
// Step 1: Create a new record input in the A_farmer_inputs collection

// export const formA_fi = async (req, res) => {
//   const { farmerId, farm_location } = req.body;
//   if (!farmerId || !farm_location) {
//       return res.status(400).json({ message: 'Missing required fields' });
//   }
//   try {
//       const newFarmerInput = await global.highValueCropsModels.A_farmer_inputs.create({
//           farmer_account_id: farmerId,
//           farm_location,
//       });
//       return res.json(newFarmerInput);
//   } catch (error) {
//       return res.status(500).json({ message: 'Error creating farmer input', error });
//   }
// };

// // Step 2: After ng farmer detail, dito na pipili ng type of crop na itatanim (Referencing A_farmer_inputs)

// export const formB_ct = async (req, res) => {
//   const { farmer_input_id, crop_type } = req.body;
//   if (!farmer_input_id || !crop_type) {
//       return res.status(400).json({ message: 'Missing required fields' });
//   }
//   try {
//       const newCropType = await global.highValueCropsModels.B_crop_types.create({
//           farmer_input_id,
//           crop_type,
//       });
//       return res.json(newCropType);
//   } catch (error) {
//       return res.status(500).json({ message: 'Error creating crop type', error });
//   }
// };

// // Step 3: If selected INDUSTRIAL CROP para sa type of crop, ito na ang next form na pupuntahan

// export const formC1_cri = async (req, res) => {
//   const { farmer_input_id, crop_type_id, crop_type, crop_variety, crop_stage } = req.body;
//   if (!farmer_input_id || !crop_type_id || !crop_type || !crop_stage) {
//       return res.status(400).json({ message: 'Missing required fields' });
//   }
//   try {
//       const newIndusRecord = await global.highValueCropsModels.C_crop_records_indus.create({
//           farmer_input_id,
//           crop_type_id,
//           crop_type,
//           crop_variety,
//           crop_stage,
//       });
//       return res.json(newIndusRecord);
//   } catch (error) {
//       return res.status(500).json({ message: 'Error creating indus record', error });
//   }
// };

// // Step 3A: If selected BANANA, COFFEE or OTHERS para sa type of crop, ito next form na pupuntahan

// export const formC2_cro = async (req, res) => {
//   const { farmer_input_id, crop_type_id, crop_variety, crop_stage } = req.body;
//   if (!farmer_input_id || !crop_type_id || !crop_variety || !crop_stage) {
//       return res.status(400).json({ message: 'Missing required fields' });
//   }
//   try {
//       const newOthersRecord = await global.highValueCropsModels.C_crop_records_others.create({
//           farmer_input_id,
//           crop_type_id,
//           crop_variety,
//           crop_stage,
//       });
//       return res.json(newOthersRecord);
//   } catch (error) {
//       return res.status(500).json({ message: 'Error creating others record', error });
//   }
// };

// // Step 4A: If selected INDUSTRIAL CROP and HARVESTING ang stage, ito next form na pupuntahan

// export const formD1_cih = async (req, res) => {
//   const { record_id, harvest_start_date, harvest_end_date, total_area_harvested, total_weight, crop_purpose, destination, mode_of_payment, mode_of_delivery } = req.body;
//   if (!record_id || !harvest_start_date || !harvest_end_date || !total_area_harvested || !total_weight || !crop_purpose) {
//       return res.status(400).json({ message: 'Missing required fields' });
//   }
//   try {
//       const newIndusHarvest = await global.highValueCropsModels.D1_crop_indus_harvest.create({
//           record_id,
//           harvest_start_date,
//           harvest_end_date,
//           crop_purpose,
//           total_area_harvested,
//           total_weight,
//           destination,
//           mode_of_payment,
//           mode_of_delivery,
//       });
//       return res.json(newIndusHarvest);
//   } catch (error) {
//       return res.status(500).json({ message: 'Error creating indus harvest', error });
//   }
// };

// // Step 4A: If selected INDUSTRIAL CROP pero NEWLY PLANTED and stage, to pupuntahan

// export const formD1_cin = async (req, res) => {
//   const { record_id, plantation_start_date, plantation_end_date, harvest_month_year, total_area_planted } = req.body;
//   if (!record_id || !plantation_start_date || !plantation_end_date || !harvest_month_year || !total_area_planted) {
//       return res.status(400).json({ message: 'Missing required fields' });
//   }
//   try {
//       const newIndusNew = await global.highValueCropsModels.D1_crop_indus_new.create({
//           record_id,
//           plantation_start_date,
//           plantation_end_date,
//           harvest_month_year,
//           total_area_planted,
//       });
//       return res.json(newIndusNew);
//   } catch (error) {
//       return res.status(500).json({ message: 'Error creating indus new', error });
//   }
// };

// // Step 4B: If selected BANANA, COFFEE or OTHERS and HARVESTING ang stage, ito next form na pupuntahan

// export const formD2_bc_ofh = async (req, res) => {
//   const { record_id, harvest_start_date, harvest_end_date, trees_harvested, total_weight, crop_purpose, destination, mode_of_payment, mode_of_delivery } = req.body;
//   if (!record_id || !harvest_start_date || !harvest_end_date || !trees_harvested || !total_weight || !crop_purpose) {
//       return res.status(400).json({ message: 'Missing required fields' });
//   }
//   try {
//       const newOthersHarvest = await global.highValueCropsModels.D2_bc_other_fct_harvest.create({
//           record_id,
//           harvest_start_date,
//           harvest_end_date,
//           trees_harvested,
//           total_weight,
//           crop_purpose,
//           destination,
//           mode_of_payment,
//           mode_of_delivery,
//       });
//       return res.json(newOthersHarvest);
//   } catch (error) {
//       return res.status(500).json({ message: 'Error creating others harvest', error });
//   }
// };

// // Step 4B: If selected BANANA, COFFEE or OTHERS pero NEWLY PLANTED ang stage, ito next na pupuntahan

// export const formD2_bc_ofn = async (req, res) => {
//   const { record_id, plantation_start_date, plantation_end_date, harvest_month_year, total_trees } = req.body;
//   if (!record_id || !plantation_start_date || !plantation_end_date || !harvest_month_year || !total_trees) {
//       return res.status(400).json({ message: 'Missing required fields' });
//   }
//   try {
//       const newOthersNew = await global.highValueCropsModels.D2_bc_other_fct_new.create({
//           record_id,
//           plantation_start_date,
//           plantation_end_date,
//           harvest_month_year,
//           total_trees,
//       });
//       return res.json(newOthersNew);
//   } catch (error) {
//       return res.status(500).json({ message: 'Error creating others new', error });
//   }
// };
export const getFarmerAccountByName = async (req, res) => {
  const {  surname, first_name, middle_name, suffix, farmer_barangay } = req.body;
  if (!surname || !first_name ) {
    return res.status(400).json({ message: 'Farmer not found.' });
  }
  try {
    const farmerAccount = await global.highValueCropsModels.FarmerAccount.findOne({
      surname: {$regex: `^${surname}$`, $options: 'i'},
      first_name: {$regex: `^${first_name}$`, $options: 'i'},
      middle_name: middle_name ? {$regex: `^${middle_name}$`, $options: 'i'} : '',
      suffix: suffix || '',
      farmer_barangay
    });

    if (!farmerAccount) {
      return res.status(404).json({ message: 'Farmer not found.' });
    }

    res.status(200).json(farmerAccount);
  } catch (error) {
    console.error('Error fetching farmer account:', error);
    res.status(500).json({ message: 'Error fetching farmer account.', error: error.message });
  }

};

export const submitCompleteFarmerForm = async (req, res) => {
  const {
    farmerInput,
    cropType,
    cropRecordIndus,
    cropRecordOther,
    cropIndusHarvest,
    cropIndusNew,
    cropOtherHarvest,
    cropOtherNew,
  } = req.body;

  // Basic validation
  if (!farmerInput || !cropType) {
    return res.status(400).json({ message: 'Missing required farmer or crop type information.' });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Create Farmer Input
    const newFarmerInput = await global.highValueCropsModels.A_farmer_inputs.create(
      [{ farmer_account_id: farmerInput.farmerId, farm_location: farmerInput.farm_location }],
      { session }
    );
    const farmerInputId = newFarmerInput[0]._id;

    // 2. Create Crop Type
    const newCropType = await global.highValueCropsModels.B_crop_types.create(
      [{ farmer_input_id: farmerInputId, crop_type: cropType }],
      { session }
    );
    const cropTypeId = newCropType[0]._id;

    let recordId;

    // 3A. Handle Industrial Crops
    if (cropRecordIndus) {
      const newIndusRecord = await global.highValueCropsModels.C_crop_records_indus.create(
        [{ ...cropRecordIndus, farmer_input_id: farmerInputId, crop_type_id: cropTypeId }],
        { session }
      );
      recordId = newIndusRecord[0]._id;

      // 4A. Handle Industrial Crop Details
      if (cropRecordIndus.crop_stage === 'HARVESTING' && cropIndusHarvest) {
        await global.highValueCropsModels.D1_crop_indus_harvest.create(
          [{ ...cropIndusHarvest, record_id: recordId }],
          { session }
        );
      } else if (cropRecordIndus.crop_stage === 'NEWLY PLANTED' && cropIndusNew) {
        await global.highValueCropsModels.D1_crop_indus_new.create(
          [{ ...cropIndusNew, record_id: recordId }],
          { session }
        );
      }
    }
    // 3B. Handle Other Crops
    else if (cropRecordOther) {
      const newOthersRecord = await global.highValueCropsModels.C_crop_records_others.create(
        [{ ...cropRecordOther, farmer_input_id: farmerInputId, crop_type_id: cropTypeId }],
        { session }
      );
      recordId = newOthersRecord[0]._id;

      // 4B. Handle Other Crop Details
      if (cropRecordOther.crop_stage === 'HARVESTING' && cropOtherHarvest) {
        await global.highValueCropsModels.D2_bc_other_fct_harvest.create(
          [{ ...cropOtherHarvest, record_id: recordId }],
          { session }
        );
      } else if (cropRecordOther.crop_stage === 'NEWLY PLANTED' && cropOtherNew) {
        await global.highValueCropsModels.D2_bc_other_fct_new.create(
          [{ ...cropOtherNew, record_id: recordId }],
          { session }
        );
      }
    }

    await session.commitTransaction();
    res.status(201).json({ message: 'Form submitted successfully.' });

  } catch (error) {
    await session.abortTransaction();
    console.error('Transaction Error:', error);
    res.status(500).json({ message: 'Error submitting form. Transaction rolled back.', error: error.message });
  } finally {
    session.endSession();
  }
};

