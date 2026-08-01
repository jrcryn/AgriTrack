import mongoose from 'mongoose';

// New endpoint for bulk submission
export const submitMultipleFarmerForms = async (req, res) => {
  const { forms } = req.body;

  // Validate input
  if (!Array.isArray(forms) || forms.length === 0) {
    return res.status(400).json({ message: 'Invalid input: forms must be a non-empty array.' });
  }

  // Validate each form
  for (let i = 0; i < forms.length; i++) {
    const { farmerInput, cropType } = forms[i];
    if (!farmerInput || !cropType) {
      return res.status(400).json({ 
        message: `Missing required information in form ${i + 1}.` 
      });
    }
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const results = [];

    for (let formIndex = 0; formIndex < forms.length; formIndex++) {
      const formData = forms[formIndex];
      const {
        farmerInput,
        cropType,
        cropRecordIndus,
        cropRecordOther,
        cropIndusHarvest,
        cropIndusNew,
        cropOtherHarvest,
        cropOtherNew,
      } = formData;

      console.log(`Processing form ${formIndex + 1}:`, {
        farmerId: farmerInput.farmerId,
        cropType,
        hasCropRecordIndus: !!cropRecordIndus,
        hasCropRecordOther: !!cropRecordOther,
        hasCropIndusHarvest: !!cropIndusHarvest,
        hasCropIndusNew: !!cropIndusNew,
        hasCropOtherHarvest: !!cropOtherHarvest,
        hasCropOtherNew: !!cropOtherNew,
      });

      // 1. Create Farmer Input
      const newFarmerInput = await global.highValueCropsModels.A_farmer_inputs.create(
        [{
          farmer_account_id: farmerInput._id,
          farmerId: farmerInput.farmerId,
          farm_location: farmerInput.farm_location
        }],
        { session }
      );
      const farmerInputId = newFarmerInput[0]._id;

      // 2. Create Crop Type
      const newCropType = await global.highValueCropsModels.B_crop_types.create(
        [{
          farmer_input_id: farmerInputId,
          farmerId: farmerInput.farmerId,
          crop_type: cropType
        }],
        { session }
      );
      const cropTypeId = newCropType[0]._id;

      let recordId;

      // 3. Handle Industrial Crops or Other Crops
      if (cropRecordIndus) {
        const newIndusRecord = await global.highValueCropsModels.C_crop_records_indus.create(
          [{
            ...cropRecordIndus,
            farmer_input_id: farmerInputId,
            crop_type_id: cropTypeId,
            farmerId: farmerInput.farmerId
          }],
          { session }
        );
        recordId = newIndusRecord[0]._id;

        // 4. Handle Industrial Crop Details
        if (cropRecordIndus.crop_stage === 'HARVESTING' && cropIndusHarvest) {
          await global.highValueCropsModels.D1_crop_indus_harvest.create(
            [{
              ...cropIndusHarvest,
              record_id: recordId,
              farmerId: farmerInput.farmerId
            }],
            { session }
          );
        } else if (cropRecordIndus.crop_stage === 'NEWLY PLANTED' && cropIndusNew) {
          await global.highValueCropsModels.D1_crop_indus_new.create(
            [{
              ...cropIndusNew,
              record_id: recordId,
              farmerId: farmerInput.farmerId
            }],
            { session }
          );
        }
      } else if (cropRecordOther) {
        const newOthersRecord = await global.highValueCropsModels.C_crop_records_others.create(
          [{
            ...cropRecordOther,
            farmer_input_id: farmerInputId,
            crop_type_id: cropTypeId,
            farmerId: farmerInput.farmerId
          }],
          { session }
        );
        recordId = newOthersRecord[0]._id;

        // 4. Handle Other Crop Details
        if (cropRecordOther.crop_stage === 'HARVESTING' && cropOtherHarvest) {
          await global.highValueCropsModels.D2_bc_other_fct_harvest.create(
            [{
              ...cropOtherHarvest,
              record_id: recordId,
              farmerId: farmerInput.farmerId
            }],
            { session }
          );
        } else if (cropRecordOther.crop_stage === 'NEWLY PLANTED' && cropOtherNew) {
          await global.highValueCropsModels.D2_bc_other_fct_new.create(
            [{
              ...cropOtherNew,
              record_id: recordId,
              farmerId: farmerInput.farmerId
            }],
            { session }
          );
        }
      }

      results.push({
        formIndex: formIndex + 1,
        farmerInputId,
        cropTypeId,
        recordId
      });
    }

    await session.commitTransaction();
    console.log(`Successfully submitted ${forms.length} forms`);
    
    res.status(201).json({ 
      message: `Successfully submitted ${forms.length} form(s).`,
      count: forms.length,
      results
    });

  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    console.error('Bulk Transaction Error:', error);
    res.status(500).json({ 
      message: 'Error submitting forms. Transaction rolled back.', 
      error: error.message 
    });
  } finally {
    session.endSession();
  }
};

// Keep the single form submission for backward compatibility
// export const submitCompleteFarmerForm = async (req, res) => {
//   const {
//     farmerInput,
//     cropType,
//     cropRecordIndus,
//     cropRecordOther,
//     cropIndusHarvest,
//     cropIndusNew,
//     cropOtherHarvest,
//     cropOtherNew,
//   } = req.body;

//   // Basic validation
//   if (!farmerInput || !cropType) {
//     return res.status(400).json({ message: 'Missing required farmer or crop type information.' });
//   }

//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     // 1. Create Farmer Input
//     const newFarmerInput = await global.highValueCropsModels.A_farmer_inputs.create(
//       [{
//         // farmer_account_id refers to the FarmerAccount's ObjectId
//         farmer_account_id: farmerInput._id,
//         farmerId: farmerInput.farmerId,
//         farm_location: farmerInput.farm_location
//       }],
//       { session }
//     );
//     const farmerInputId = newFarmerInput[0]._id;

//     // 2. Create Crop Type
//     const newCropType = await global.highValueCropsModels.B_crop_types.create(
//       [{
//         farmer_input_id: farmerInputId,
//         farmerId: farmerInput.farmerId,
//         crop_type: cropType
//       }],
//       { session }
//     );
//     const cropTypeId = newCropType[0]._id;

//     let recordId;

//     // 3A. Handle Industrial Crops
//     if (cropRecordIndus) {
//       const newIndusRecord = await global.highValueCropsModels.C_crop_records_indus.create(
//         [{
//           ...cropRecordIndus,
//           farmer_input_id: farmerInputId,
//           crop_type_id: cropTypeId,
//           farmerId: farmerInput.farmerId
//         }],
//         { session }
//       );
//       recordId = newIndusRecord[0]._id;

//       // 4A. Handle Industrial Crop Details
//       if (cropRecordIndus.crop_stage === 'HARVESTING' && cropIndusHarvest) {
//         await global.highValueCropsModels.D1_crop_indus_harvest.create(
//           [{
//             ...cropIndusHarvest,
//             record_id: recordId,
//             farmerId: farmerInput.farmerId
//           }],
//           { session }
//         );
//       } else if (cropRecordIndus.crop_stage === 'NEWLY PLANTED' && cropIndusNew) {
//         await global.highValueCropsModels.D1_crop_indus_new.create(
//           [{
//             ...cropIndusNew,
//             record_id: recordId,
//             farmerId: farmerInput.farmerId
//           }],
//           { session }
//         );
//       }
//     }
//     // 3B. Handle Other Crops
//     else if (cropRecordOther) {
//       const newOthersRecord = await global.highValueCropsModels.C_crop_records_others.create(
//         [{
//           ...cropRecordOther,
//           farmer_input_id: farmerInputId,
//           crop_type_id: cropTypeId,
//           farmerId: farmerInput.farmerId
//         }],
//         { session }
//       );
//       recordId = newOthersRecord[0]._id;

//       // 4B. Handle Other Crop Details
//       if (cropRecordOther.crop_stage === 'HARVESTING' && cropOtherHarvest) {
//         await global.highValueCropsModels.D2_bc_other_fct_harvest.create(
//           [{
//             ...cropOtherHarvest,
//             record_id: recordId,
//             farmerId: farmerInput.farmerId
//           }],
//           { session }
//         );
//       } else if (cropRecordOther.crop_stage === 'NEWLY PLANTED' && cropOtherNew) {
//         await global.highValueCropsModels.D2_bc_other_fct_new.create(
//           [{
//             ...cropOtherNew,
//             record_id: recordId,
//             farmerId: farmerInput.farmerId
//           }],
//           { session }
//         );
//       }
//     }

//     await session.commitTransaction();
//     res.status(201).json({ message: 'Form submitted successfully.' });

//   } catch (error) {
//     await session.abortTransaction();
//     console.error('Transaction Error:', error);
//     res.status(500).json({ message: 'Error submitting form. Transaction rolled back.', error: error.message });
//   } finally {
//     session.endSession();
//   }
// };

