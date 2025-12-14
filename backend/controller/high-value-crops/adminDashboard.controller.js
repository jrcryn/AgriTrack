import { getHighValueCropsDB } from '../../config/dbAccessHelper.js';
import mongoose from 'mongoose';
import { logAction } from '../../utils/logAction.js';

//________________________________ FARMERS NEW RESPONSES PAGE ____________________________________


// Get all unvalidated farmer inputs with their referenced documents
export const getUnvalidatedFarmerInputs = async (req, res) => { 
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5; // Default to 5 per page for each section
    const skip = (page - 1) * limit;
    const cropStage = req.query.crop_stage; // 'NEWLY PLANTED' or 'HARVESTING'

    if (!cropStage) {
      return res.status(400).json({ message: 'crop_stage query parameter is required.' });
    }

    // Base query for unvalidated farmer inputs
    const baseQuery = { 
      isValidated: false, 
      $or: [
        { isArchived: false },
        { isArchived: { $exists: false } }
      ]
    };

    // Find all unvalidated farmer inputs and get their IDs
    const unvalidatedInputIds = (await global.highValueCropsModels.A_farmer_inputs.find(baseQuery).select('_id')).map(doc => doc._id);

    // Find related crop records based on the crop stage
    const indusRecords = await global.highValueCropsModels.C_crop_records_indus.find({ farmer_input_id: { $in: unvalidatedInputIds }, crop_stage: cropStage }).select('farmer_input_id');
    const othersRecords = await global.highValueCropsModels.C_crop_records_others.find({ farmer_input_id: { $in: unvalidatedInputIds }, crop_stage: cropStage }).select('farmer_input_id');

    const relevantFarmerInputIds = [
      ...indusRecords.map(r => r.farmer_input_id),
      ...othersRecords.map(r => r.farmer_input_id)
    ];

    const totalCount = relevantFarmerInputIds.length;

    // Fetch the paginated farmer inputs based on the filtered IDs
    const farmerInputs = await global.highValueCropsModels.A_farmer_inputs
      .find({ _id: { $in: relevantFarmerInputIds } })
      .populate({ path: 'farmer_account_id', model: global.globalModels.FarmerAccount })
      .populate({ path: 'editConsent.editRequestId', model: global.highValueCropsModels.EditRequest })
      .sort({ createdAt: -1 })
      .lean()
      .skip(skip)
      .limit(limit);

    const results = await Promise.all(farmerInputs.map(async (farmerInput) => {
      const cropType = await global.highValueCropsModels.B_crop_types.findOne({ farmer_input_id: farmerInput._id }).lean();
      
      // This check is now less likely to fail, but good for safety
      if (!cropType) {
        return { farmerInput, cropType: null, cropRecord: null, cropDetails: null };
      }
      
      let cropRecord, cropDetails;

      if (cropType.crop_type === 'VEGETABLES, ROOT CROPS AND OTHER INDUSTRIAL CROPS') {
        cropRecord = await global.highValueCropsModels.C_crop_records_indus.findOne({ farmer_input_id: farmerInput._id }).lean();
        
        if (!cropRecord) {
          return { farmerInput, cropType, cropRecord: null, cropDetails: null };
        }
        
        if (cropRecord.crop_stage === 'NEWLY PLANTED') {
          cropDetails = await global.highValueCropsModels.D1_crop_indus_new.findOne({ record_id: cropRecord._id }).lean();
        } else if (cropRecord.crop_stage === 'HARVESTING') {
          cropDetails = await global.highValueCropsModels.D1_crop_indus_harvest.findOne({ record_id: cropRecord._id }).lean();
        }
      } else {
        cropRecord = await global.highValueCropsModels.C_crop_records_others.findOne({ farmer_input_id: farmerInput._id }).lean();
        
        if (!cropRecord) {
          return { farmerInput, cropType, cropRecord: null, cropDetails: null };
        }
        
        if (cropRecord.crop_stage === 'NEWLY PLANTED') {
          cropDetails = await global.highValueCropsModels.D2_bc_other_fct_new.findOne({ record_id: cropRecord._id }).lean();
        } else if (cropRecord.crop_stage === 'HARVESTING') {
          cropDetails = await global.highValueCropsModels.D2_bc_other_fct_harvest.findOne({ record_id: cropRecord._id }).lean();
        }
      }

      return {
        farmerInput,
        cropType,
        cropRecord,
        cropDetails
      };
    }));

    res.json({
      results,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error fetching unvalidated farmer inputs', error: error.message });
  }
};

// Get all unvalidated and archived farmer inputs with their referenced documents
export const getUnvalidatedArchivedFarmerInputs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5; // Default to 5 per page for each section
    const skip = (page - 1) * limit;
    const cropStage = req.query.crop_stage; // 'NEWLY PLANTED' or 'HARVESTING'

    if (!cropStage) {
      return res.status(400).json({ message: 'crop_stage query parameter is required.' });
    }

    // Base query for unvalidated farmer inputs
    const baseQuery = { 
      isValidated: false,
      isArchived: true            // <-- only true; do not match "exists: true"
    };

    // Find all unvalidated farmer inputs and get their IDs
    const unvalidatedInputIds = (await global.highValueCropsModels.A_farmer_inputs.find(baseQuery).select('_id')).map(doc => doc._id);

    // Find related crop records based on the crop stage
    const indusRecords = await global.highValueCropsModels.C_crop_records_indus.find({ farmer_input_id: { $in: unvalidatedInputIds }, crop_stage: cropStage }).select('farmer_input_id');
    const othersRecords = await global.highValueCropsModels.C_crop_records_others.find({ farmer_input_id: { $in: unvalidatedInputIds }, crop_stage: cropStage }).select('farmer_input_id');

    const relevantFarmerInputIds = [
      ...indusRecords.map(r => r.farmer_input_id),
      ...othersRecords.map(r => r.farmer_input_id)
    ];

    const totalCount = relevantFarmerInputIds.length;

    // Fetch the paginated farmer inputs based on the filtered IDs
    const farmerInputs = await global.highValueCropsModels.A_farmer_inputs
      .find({ _id: { $in: relevantFarmerInputIds } })
      .populate({ path: 'farmer_account_id', model: global.globalModels.FarmerAccount })
      .sort({ createdAt: -1 })
      .lean()
      .skip(skip)
      .limit(limit);

    const results = await Promise.all(farmerInputs.map(async (farmerInput) => {
      const cropType = await global.highValueCropsModels.B_crop_types.findOne({ farmer_input_id: farmerInput._id }).lean();
      
      // This check is now less likely to fail, but good for safety
      if (!cropType) {
        return { farmerInput, cropType: null, cropRecord: null, cropDetails: null };
      }
      
      let cropRecord, cropDetails;

      if (cropType.crop_type === 'VEGETABLES, ROOT CROPS AND OTHER INDUSTRIAL CROPS') {
        cropRecord = await global.highValueCropsModels.C_crop_records_indus.findOne({ farmer_input_id: farmerInput._id }).lean();
        
        if (!cropRecord) {
          return { farmerInput, cropType, cropRecord: null, cropDetails: null };
        }
        
        if (cropRecord.crop_stage === 'NEWLY PLANTED') {
          cropDetails = await global.highValueCropsModels.D1_crop_indus_new.findOne({ record_id: cropRecord._id }).lean();
        } else if (cropRecord.crop_stage === 'HARVESTING') {
          cropDetails = await global.highValueCropsModels.D1_crop_indus_harvest.findOne({ record_id: cropRecord._id }).lean();
        }
      } else {
        cropRecord = await global.highValueCropsModels.C_crop_records_others.findOne({ farmer_input_id: farmerInput._id }).lean();
        
        if (!cropRecord) {
          return { farmerInput, cropType, cropRecord: null, cropDetails: null };
        }
        
        if (cropRecord.crop_stage === 'NEWLY PLANTED') {
          cropDetails = await global.highValueCropsModels.D2_bc_other_fct_new.findOne({ record_id: cropRecord._id }).lean();
        } else if (cropRecord.crop_stage === 'HARVESTING') {
          cropDetails = await global.highValueCropsModels.D2_bc_other_fct_harvest.findOne({ record_id: cropRecord._id }).lean();
        }
      }

      return {
        farmerInput,
        cropType,
        cropRecord,
        cropDetails
      };
    }));

    res.json({
      results,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error fetching unvalidated farmer inputs', error: error.message });
  }
};

// for updating the response field using the edit request document
export const updateFarmerResponseFields = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  let userId = null;

  try {
    // Extract userId from decoded token
    if (req.decodedAuthToken && req.decodedAuthToken.payload) {
      userId = req.decodedAuthToken.payload.userId;
    }

    const { farmerId } = req.params;
    if (!farmerId) {
      await session.abortTransaction();
      return res.status(400).json({ message: 'farmerId is required.' });
    }

    // Check if the response is flagged for review
    const farmerInput = await global.highValueCropsModels.A_farmer_inputs
      .findById(farmerId)
      .populate({ path: 'editConsent.editRequestId', model: global.highValueCropsModels.EditRequest })
      .session(session);

    if (!farmerInput) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Farmer response not found.' });
    }

    if (farmerInput.isForReview !== true) {
      await session.abortTransaction();
      return res.status(400).json({ message: 'Only flagged responses can be updated.' });
    }

    if (farmerInput.editConsent.status !== 'Granted' && farmerInput.validationVisitDetails?.isValidationVisitDetailsApproved !== true) {
      await session.abortTransaction();
      return res.status(403).json({ message: 'Updating this response requires either farmer consent (Granted) or manager approval (Validation Visit Approved).' });
    }

    if (!farmerInput.editConsent.editRequestId) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Edit request not found.' });
    }

    const editRequest = farmerInput.editConsent.editRequestId;
    const editRequestId = editRequest._id; // Store the ID for deletion
    const updates = {};

    // Extract only non-null/undefined fields from editRequest
    if (editRequest.total_area_planted != null) updates.total_area_planted = editRequest.total_area_planted;
    if (editRequest.total_trees != null) updates.total_trees = editRequest.total_trees;
    if (editRequest.total_area_harvested != null) updates.total_area_harvested = editRequest.total_area_harvested;
    if (editRequest.trees_harvested != null) updates.trees_harvested = editRequest.trees_harvested;
    if (editRequest.total_weight != null) updates.total_weight = editRequest.total_weight;

    if (Object.keys(updates).length === 0) {
      await session.abortTransaction();
      return res.status(400).json({ message: 'No valid updates found in edit request.' });
    }

    // Find crop type and crop record
    const cropType = await global.highValueCropsModels.B_crop_types
      .findOne({ farmer_input_id: farmerId })
      .session(session)
      .lean();

    if (!cropType) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Crop type not found.' });
    }

    let cropRecord, cropDetails, updateFields = {};

    if (cropType.crop_type === 'VEGETABLES, ROOT CROPS AND OTHER INDUSTRIAL CROPS') {
      cropRecord = await global.highValueCropsModels.C_crop_records_indus
        .findOne({ farmer_input_id: farmerId })
        .session(session);

      if (!cropRecord) {
        await session.abortTransaction();
        return res.status(404).json({ message: 'Crop record not found.' });
      }

      if (cropRecord.crop_stage === 'NEWLY PLANTED') {
        cropDetails = await global.highValueCropsModels.D1_crop_indus_new
          .findOne({ record_id: cropRecord._id })
          .session(session);
        
        // Only allow total_area_planted
        if ('total_area_planted' in updates) updateFields.total_area_planted = updates.total_area_planted;
      } else if (cropRecord.crop_stage === 'HARVESTING') {
        cropDetails = await global.highValueCropsModels.D1_crop_indus_harvest
          .findOne({ record_id: cropRecord._id })
          .session(session);
        
        // Only allow total_weight, total_area_harvested
        if ('total_weight' in updates) updateFields.total_weight = updates.total_weight;
        if ('total_area_harvested' in updates) updateFields.total_area_harvested = updates.total_area_harvested;
      }
    } else {
      cropRecord = await global.highValueCropsModels.C_crop_records_others
        .findOne({ farmer_input_id: farmerId })
        .session(session);

      if (!cropRecord) {
        await session.abortTransaction();
        return res.status(404).json({ message: 'Crop record not found.' });
      }

      if (cropRecord.crop_stage === 'NEWLY PLANTED') {
        cropDetails = await global.highValueCropsModels.D2_bc_other_fct_new
          .findOne({ record_id: cropRecord._id })
          .session(session);
        
        // Only allow total_trees
        if ('total_trees' in updates) updateFields.total_trees = updates.total_trees;
      } else if (cropRecord.crop_stage === 'HARVESTING') {
        cropDetails = await global.highValueCropsModels.D2_bc_other_fct_harvest
          .findOne({ record_id: cropRecord._id })
          .session(session);
        
        // Only allow total_weight, trees_harvested
        if ('total_weight' in updates) updateFields.total_weight = updates.total_weight;
        if ('trees_harvested' in updates) updateFields.trees_harvested = updates.trees_harvested;
      }
    }

    if (!cropDetails) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Crop details not found.' });
    }

    // Update only allowed fields
    Object.assign(cropDetails, updateFields);
    await cropDetails.save({ session });

    // Update successfullyUpdated flag and editConsent status
    await global.highValueCropsModels.A_farmer_inputs.findByIdAndUpdate(
      farmerId,
      {
        $set: {
          successfullyUpdated: false,
          isCurrentlyEditRequest: false,
          requiredValidationVisit: false
        },
        $unset: {
          editConsent: "",
          validationVisitDetails: ""
        }
      },
      { session }
    );

    // Delete the edit request document
    await global.highValueCropsModels.EditRequest.findByIdAndDelete(editRequestId, { session });

    await session.commitTransaction();

    await logAction(req, userId, 'FARMER_RESPONSE_FIELDS_UPDATED', 'HIGH-VALUE CROPS', `Updated farmer response fields for farmer input ID: ${farmerId}`, 'SUCCESS');

    // Return updated details
    res.json({
      message: 'Fields updated successfully.'
    });
  } catch (error) {
    await session.abortTransaction();
    console.error('Error updating fields:', error);

    await logAction(req, userId, 'FARMER_RESPONSE_FIELDS_UPDATED', 'HIGH-VALUE CROPS', `Error updating farmer response fields: ${error.message}`, 'FAILED');

    res.status(500).json({ message: 'Error updating fields.', error: error.message });
  } finally {
    session.endSession();
  }
};


// Create unified farmer response
export const createUnifiedFarmerResponse = async (req, res) => {
  const { 
    farmer_account_id, farmerId, farm_location,
    crop_type, commodity, crop_stage,
    plantation_start_date, plantation_end_date, harvest_month_year,
    total_area_planted, total_area_trees_planted,
    harvest_start_date, harvest_end_date, total_weight,
    crop_purpose, destination, mode_of_payment, mode_of_delivery,
    total_area_harvested, total_area_trees_harvested,
    original_farmer_input_id
  } = req.body;

  if (!farmer_account_id || !farm_location || !crop_type || !commodity || !crop_stage || !original_farmer_input_id) {
    return res.status(400).json({ message: `Required data aren't provided.` });
  }

  const checkFlagForReview = await global.highValueCropsModels.A_farmer_inputs.findById({ _id: original_farmer_input_id });

  if (checkFlagForReview.isForReview === true) {
    return res.status(400).json({ success: false, message: "Cannot push responses that are flagged for review." });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  let userId = null;

  try {
    // Extract userId from decoded token
    if (req.decodedAuthToken && req.decodedAuthToken.payload) {
      userId = req.decodedAuthToken.payload.userId;
    }

    // Determine the year based on available dates
    let year;
    if (crop_stage === 'NEWLY PLANTED') {
      // For newly planted, use plantation start date year lang 
      if (plantation_start_date) {
        year = new Date(plantation_start_date).getFullYear();
      } else {
        year = new Date().getFullYear();
      }
    } else {
      // For harvesting, use harvest date same sa taas
      if (harvest_start_date) {
        year = new Date(harvest_start_date).getFullYear();
      } else {
        year = new Date().getFullYear();
      }
    }
    
    // Get the appropriate model for this year
    const UnifiedFarmerRecordModel = global.getUnifiedFarmerRecordModel(year);
    
    const newUnifiedRecord = await UnifiedFarmerRecordModel.create([{
      farmer_account_id, farmerId, farm_location,
      crop_type, commodity, crop_stage,
      plantation_start_date, plantation_end_date, harvest_month_year,
      total_area_planted, total_area_trees_planted,
      harvest_start_date, harvest_end_date, total_weight,
      crop_purpose, destination, mode_of_payment, mode_of_delivery,
      total_area_harvested, total_area_trees_harvested
    }], {session});

    if (original_farmer_input_id) {
      // Delete all related documents
      await deleteRelatedDocuments(original_farmer_input_id, session);
    }

    await session.commitTransaction();

    await logAction(req, userId, 'FARMER_RESPONSE_SUBMITTED_TO_METRICS', 'HIGH-VALUE CROPS', `Pushed farmer response with ID: ${original_farmer_input_id} to unified records for year ${year}`, 'SUCCESS');

    return res.status(201).json({
      message: `Successfully pushed to the main records.`,
      data: newUnifiedRecord
    });

  } catch (error) {
    await session.abortTransaction();

    await logAction(req, userId, 'FARMER_RESPONSE_SUBMITTED_TO_METRICS', 'HIGH-VALUE CROPS', `Error pushing farmer response to unified records: ${error.message}`, 'FAILED');

    res.status(500).json({ message: 'Error pushing to the main records.', error: error.message });
  } finally {
    session.endSession();
  }
};


// helper controller for deleting initial farmer response and its related documents
const deleteRelatedDocuments = async (farmerId, session) => {
  // Find crop type to determine which documents to delete
  const cropType = await global.highValueCropsModels.B_crop_types.findOne({ farmer_input_id: farmerId }).session(session);
  if (cropType) {
    const isIndustrialCrop = cropType.crop_type === 'VEGETABLES, ROOT CROPS AND OTHER INDUSTRIAL CROPS';
    
    if (isIndustrialCrop) {
      // Get crop record to determine if newly planted or harvesting
      const cropRecord = await global.highValueCropsModels.C_crop_records_indus.findOne({ farmer_input_id: farmerId }).session(session);
      
      if (cropRecord) {
        if (cropRecord.crop_stage === 'NEWLY PLANTED') {
          await global.highValueCropsModels.D1_crop_indus_new.deleteOne({ record_id: cropRecord._id }).session(session);
        } else if (cropRecord.crop_stage === 'HARVESTING') {
          await global.highValueCropsModels.D1_crop_indus_harvest.deleteOne({ record_id: cropRecord._id }).session(session);
        }
        await global.highValueCropsModels.C_crop_records_indus.deleteOne({ _id: cropRecord._id }).session(session);
      }
    } 
    // Delete process for other crops (trees, fruits, etc.)
    else {
      const cropRecord = await global.highValueCropsModels.C_crop_records_others.findOne({ farmer_input_id: farmerId }).session(session);
      if (cropRecord) {
        // Delete appropriate detail record based on crop stage
        if (cropRecord.crop_stage === 'NEWLY PLANTED') {
          await global.highValueCropsModels.D2_bc_other_fct_new.deleteOne({ record_id: cropRecord._id }).session(session);
        } else if (cropRecord.crop_stage === 'HARVESTING') {
          await global.highValueCropsModels.D2_bc_other_fct_harvest.deleteOne({ record_id: cropRecord._id }).session(session);
        }
        
        // Delete the crop record
        await global.highValueCropsModels.C_crop_records_others.deleteOne({ _id: cropRecord._id }).session(session);
      }
    }
    
    // Delete the crop type record
    await global.highValueCropsModels.B_crop_types.deleteOne({ _id: cropType._id }).session(session);
  }
  
  // Finally delete the farmer input document
  await global.highValueCropsModels.A_farmer_inputs.deleteOne({ _id: farmerId }).session(session);
};


export const flagResponseForReview = async (req, res) => {
  const { farmerId } = req.params;

  let userId = null;

  try {
    // Extract userId from decoded token
    if (req.decodedAuthToken && req.decodedAuthToken.payload) {
      userId = req.decodedAuthToken.payload.userId;
    }

    const response = await global.highValueCropsModels.A_farmer_inputs.findById(farmerId);

    if (!response) {
      return res.status(404).json({ message: 'Farmer response not found.' });
    };

    await global.highValueCropsModels.A_farmer_inputs.updateOne(
      { _id: farmerId },
      { $set: { isForReview: true } }
    );

    await logAction(req, userId, 'FARMER_RESPONSE_FLAGGED', 'HIGH-VALUE CROPS', `Flagged farmer response with ID: ${farmerId} for review`, 'SUCCESS');

    return res.status(200).json({ message: 'Farmer response flagged for review.' });

  } catch (error) {
    await logAction(req, userId, 'FARMER_RESPONSE_FLAGGED', 'HIGH-VALUE CROPS', `Error flagging farmer response for review: ${error.message}`, 'FAILED');
    res.status(500).json({ message: 'Error flagging response for review', error: error.message });
  }
};

export const unflagResponseForReview = async (req, res) => {
  const { farmerId } = req.params;

  let userId = null;

  try {
    // Extract userId from decoded token
    if (req.decodedAuthToken && req.decodedAuthToken.payload) {
      userId = req.decodedAuthToken.payload.userId;
    }

    const response = await global.highValueCropsModels.A_farmer_inputs.findById(farmerId);

    if (!response) {
      return res.status(404).json({ message: 'Farmer response not found.' });
    };

    await global.highValueCropsModels.A_farmer_inputs.updateOne(
      { _id: farmerId },
      { $set: { isForReview: false } }
    );

    await logAction(req, userId, 'FARMER_RESPONSE_UNFLAGGED', 'HIGH-VALUE CROPS', `Unflagged farmer response with ID: ${farmerId} for review`, 'SUCCESS');

    return res.status(200).json({ message: 'Farmer response unflagged for review.' });

  } catch (error) {

    await logAction(req, userId, 'FARMER_RESPONSE_UNFLAGGED', 'HIGH-VALUE CROPS', `Error unflagging farmer response for review: ${error.message}`, 'FAILED');

    res.status(500).json({ message: 'Error unflagging response for review', error: error.message });
  }
};

export const formStatusEnable = async (req, res) => {
  let userId = null;

  try {
    // Extract userId from decoded token
    if (req.decodedAuthToken && req.decodedAuthToken.payload) {
      userId = req.decodedAuthToken.payload.userId;
    }

    await global.highValueCropsModels.FormStatus.findOneAndUpdate(
      {},                                   // filter
      { $set: { formStatus: true } },      // update
      { upsert: true, new: true }           // options
    );

    await logAction(req, userId, 'HVC_FORM_ENABLED', 'HIGH-VALUE CROPS', 'High-Value Crops form enabled successfully', 'SUCCESS');

    return res.status(200).json({ message: 'High-Value Crops form enabled successfully.' });
  } catch (error) {

    await logAction(req, userId, 'HVC_FORM_ENABLED', 'HIGH-VALUE CROPS', `Error enabling High-Value Crops form: ${error.message}`, 'FAILED');

    return res.status(500).json({ message: 'Error enabling High-Value Crops form', error: error.message });
  }
};

export const formStatusDisable = async (req, res) => {
  let userId = null;

  try {
    // Extract userId from decoded token
    if (req.decodedAuthToken && req.decodedAuthToken.payload) {
      userId = req.decodedAuthToken.payload.userId;
    }

    await global.highValueCropsModels.FormStatus.findOneAndUpdate(
      {},                                   // filter
      { $set: { formStatus: false } },      // update
      { upsert: true, new: true }           // options
    );

    await logAction(req, userId, 'HVC_FORM_DISABLED', 'HIGH-VALUE CROPS', 'High-Value Crops form disabled successfully', 'SUCCESS');

    return res.status(200).json({ message: 'High-Value Crops form disabled successfully.' });
  } catch (error) {

    await logAction(req, userId, 'HVC_FORM_DISABLED', 'HIGH-VALUE CROPS', `Error disabling High-Value Crops form: ${error.message}`, 'FAILED');

    return res.status(500).json({ message: 'Error disabling High-Value Crops form', error: error.message });
  }
};

export const checkFormStatus = async (req, res) => {
  try {
    const statusDoc = await global.highValueCropsModels.FormStatus.findOne({});
    const isOpen = Boolean(statusDoc?.formStatus);

    if (!isOpen) {
      return res.status(403).json({ success: false, open: false, message: 'High-Value Crops form is currently disabled.' });
    }

    return res.status(200).json({ success: true, open: true, message: 'High-Value Crops form is currently enabled.' });
  } catch (error) {
    return res.status(500).json({ message: 'Error checking form status', error: error.message });
  }
};

export const archiveResponse = async (req, res) => {
  const { inputId } = req.body;
  
  let userId = null;

  if (!inputId) {
    return res.status(400).json({ message: 'Farmer response ID is required.' });
  }

  try {
    // Extract userId from decoded token
    if (req.decodedAuthToken && req.decodedAuthToken.payload) {
      userId = req.decodedAuthToken.payload.userId;
    }

    const farmerInput = await global.highValueCropsModels.A_farmer_inputs.findById(inputId);
    
    if (!farmerInput) {
      return res.status(404).json({ message: 'Farmer response not found.' });
    }

    // Check if already archived
    if (farmerInput.isArchived === true) {
      return res.status(400).json({ message: 'Farmer response is already archived.' });
    }

    // Update isArchived to true
    await global.highValueCropsModels.A_farmer_inputs.updateOne(
      { _id: inputId },
      { $set: { isArchived: true } }
    );

    await logAction(req, userId, 'FARMER_RESPONSE_ARCHIVED', 'HIGH-VALUE CROPS', `Archived farmer response with ID: ${inputId}`, 'SUCCESS');

    return res.status(200).json({ 
      message: 'Farmer response archived successfully.',
      inputId: inputId 
    });

  } catch (error) {

    await logAction(req, userId, 'FARMER_RESPONSE_ARCHIVED', 'HIGH-VALUE CROPS', `Error archiving farmer response with ID: ${inputId}`, 'FAILED');

    return res.status(500).json({ 
      message: 'Error archiving farmer response', 
      error: error.message 
    });
  }
};

export const unarchiveResponse = async (req, res) => {
  const { inputId } = req.body;
  
  let userId = null;

  if (!inputId) {
    return res.status(400).json({ message: 'Farmer response ID is required.' });
  }

  try {
    // Extract userId from decoded token
    if (req.decodedAuthToken && req.decodedAuthToken.payload) {
      userId = req.decodedAuthToken.payload.userId;
    }

    const farmerInput = await global.highValueCropsModels.A_farmer_inputs.findById(inputId);
    
    if (!farmerInput) {
      return res.status(404).json({ message: 'Farmer response not found.' });
    }

    // Check if already unarchived
    if (farmerInput.isArchived === false) {
      return res.status(400).json({ message: 'Farmer response is already unarchived.' });
    }

    // Update isArchived to false
    await global.highValueCropsModels.A_farmer_inputs.updateOne(
      { _id: inputId },
      { $set: { isArchived: false } }
    );

    await logAction(req, userId, 'FARMER_RESPONSE_UNARCHIVED', 'HIGH-VALUE CROPS', `Unarchived farmer response with ID: ${inputId}`, 'SUCCESS');

    return res.status(200).json({ 
      message: 'Farmer response unarchived successfully.',
      inputId: inputId 
    });

  } catch (error) {

    await logAction(req, userId, 'FARMER_RESPONSE_UNARCHIVED', 'HIGH-VALUE CROPS', `Error unarchiving farmer response: ${error.message}`, 'FAILED');

    return res.status(500).json({ 
      message: 'Error unarchiving farmer response', 
      error: error.message 
    });
  }
};

export const requestEdit = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  let userId = null;

  try {
    // Extract userId from decoded token
    if (req.decodedAuthToken && req.decodedAuthToken.payload) {
      userId = req.decodedAuthToken.payload.userId;
    }

    const { farmerId, crop_stage, updates, reason } = req.body;
    if (!farmerId || !crop_stage || !updates) {
      return res.status(400).json({ message: 'farmerId, crop_stage, and updates are required.' });
    }

    // Validate that updates object has at least one non-empty value
    const hasValidUpdates = Object.values(updates).some(value => {
      // Check if value exists and is not an empty string
      return value !== null && value !== undefined && value !== '';
    });

    if (!hasValidUpdates) {
      await session.abortTransaction();
      return res.status(400).json({ 
        message: 'At least one valid update value is required.' 
      });
    }

    // Check if the response is flagged for review
    const farmerInput = await global.highValueCropsModels.A_farmer_inputs.findById(farmerId).session(session);
    console.log(farmerInput);
    if (!farmerInput) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Farmer response not found.' }); 
    }
    if (farmerInput.isForReview !== true) {
      await session.abortTransaction();
      return res.status(400).json({ message: 'Only flagged responses can be requested for edit.' });
    }

    if (farmerInput.editConsent?.editRequestId) {
      await global.highValueCropsModels.EditRequest.findByIdAndDelete(
        farmerInput.editConsent.editRequestId, 
        { session }
      );
    }

    // Find crop type and crop record
    const cropType = await global.highValueCropsModels.B_crop_types.findOne({ farmer_input_id: farmerId }).session(session).lean();
    if (!cropType) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Crop type not found.' });
    }

    //find the farmer account
    const farmer = await global.globalModels.FarmerAccount.findById(farmerInput.farmer_account_id).session(session);
    if (!farmer) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Farmer account not found.' });
    }

    const phone = farmer.mobile_number;
    const farmerName = farmer.first_name;

    let cropRecord, cropDetails, updateFields = {}, cropStage;

    if (cropType.crop_type === 'VEGETABLES, ROOT CROPS AND OTHER INDUSTRIAL CROPS') {
      cropRecord = await global.highValueCropsModels.C_crop_records_indus.findOne({ farmer_input_id: farmerId }).session(session);
      if (!cropRecord) {
        await session.abortTransaction();
        return res.status(404).json({ message: 'Crop record not found.' });
      }

      if (crop_stage === 'NEWLY PLANTED') {
        cropStage = 'newlyPlanted'
        cropDetails = await global.highValueCropsModels.D1_crop_indus_new.findOne({ record_id: cropRecord._id }).session(session);
        if ('total_area_planted' in updates) updateFields.total_area_planted = updates.total_area_planted;
      } else if (crop_stage === 'HARVESTING') {
        cropStage = 'harvesting'
        cropDetails = await global.highValueCropsModels.D1_crop_indus_harvest.findOne({ record_id: cropRecord._id }).session(session);
        if ('total_weight' in updates) updateFields.total_weight = updates.total_weight;
        if ('total_area_harvested' in updates) updateFields.total_area_harvested = updates.total_area_harvested;
      }
    } else {
      cropRecord = await global.highValueCropsModels.C_crop_records_others.findOne({ farmer_input_id: farmerId }).session(session);
      if (!cropRecord) {
        await session.abortTransaction();
        return res.status(404).json({ message: 'Crop record not found.' });
      }

      if (crop_stage === 'NEWLY PLANTED') {
        cropStage = 'newlyPlanted'
        cropDetails = await global.highValueCropsModels.D2_bc_other_fct_new.findOne({ record_id: cropRecord._id }).session(session);
        if ('total_trees' in updates) updateFields.total_trees = updates.total_trees;
      } else if (crop_stage === 'HARVESTING') {
        cropStage = 'harvesting'
        cropDetails = await global.highValueCropsModels.D2_bc_other_fct_harvest.findOne({ record_id: cropRecord._id }).session(session);
        if ('total_weight' in updates) updateFields.total_weight = updates.total_weight;
        if ('trees_harvested' in updates) updateFields.trees_harvested = updates.trees_harvested;
      }
    }
    
    if (!cropDetails) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Crop details not found.' });
    }

    if (Object.keys(updateFields).length === 0) {
      await session.abortTransaction();
      return res.status(400).json({ message: 'No allowed fields provided for update.' });
    }

    // Build edit request payload
    const editPayload = {
      farmer_input_id: farmerId,
      ...updateFields
    };

    // Create edit request document within transaction
    const editDoc = await global.highValueCropsModels.EditRequest.create([editPayload], { session });

    // Update farmer input within transaction
    await global.highValueCropsModels.A_farmer_inputs.findOneAndUpdate(
      { _id: farmerId },
      {
        editConsent: {
          status: "Pending",
          editRequestId: editDoc[0]._id,
          reason: reason
        },
      },
      { session }
    );

    const reviewLink = `${process.env.CLIENT_URL}/hvc/consent-request/${editDoc[0]._id}`;

    //Send SMS (if this fails, transaction will rollback)
    try {
      if (cropStage === 'newlyPlanted') {
        await sendNewlyPlantedCropCorrectionSMS(phone, farmerName, reviewLink);
      } else {
        await sendHarvestingCropCorrectionSMS(phone, farmerName, reviewLink);
      }
    } catch (smsError) {
      // Rollback transaction if SMS fails
      await session.abortTransaction();
      console.error('SMS sending failed:', smsError);
      return res.status(500).json({ 
        message: 'Failed to send SMS notification to farmer. Edit request was not created.', 
        error: smsError.message 
      });
    }

    // Commit the transaction only if everything succeeded
    await session.commitTransaction();

    await logAction(req, userId, 'SMS_SENT_FOR_EDIT_REQUEST', 'HIGH-VALUE CROPS', `Edit request SMS sent for response: ${farmerId} and created edit request: ${editDoc[0]._id}`, 'SUCCESS');

    return res.json({
      message: 'Edit request recorded. Awaiting farmer consent.',
    });
  } catch (error) {
    // Rollback transaction on any error
    await session.abortTransaction();

    await logAction(req, userId, 'SMS_SENT_FOR_EDIT_REQUEST', 'HIGH-VALUE CROPS', `Error recording edit request: ${error.message}`, 'FAILED');

    console.log(error);
    return res.status(500).json({ message: 'Error recording edit request.', error: error.message });
  } finally {
    session.endSession();
  }
};

export const getRequestEditDetailsForFarmerView = async (req, res) => { //ito yung controller pang kuha ng necessary informations para doon sa link na bubuksan ni farmer
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: 'Edit request id is required.' });
    }

    // 1) Find the edit request document
    const editRequest = await global.highValueCropsModels.EditRequest.findById(id).lean();
    if (!editRequest) {
      return res.status(404).json({ message: 'Edit request not found.' });
    }

    const farmerInputId = editRequest.farmer_input_id;

    // 2) Find the related unvalidated farmer input with farmer account
    const farmerInput = await global.highValueCropsModels.A_farmer_inputs
      .findOne({ _id: farmerInputId, isValidated: false })
      .populate({ path: 'farmer_account_id', model: global.globalModels.FarmerAccount })
      .lean();

    if (!farmerInput) {
      return res.status(404).json({ message: 'Unvalidated farmer response not found.' });
    }

    // 3) Copy the consolidation logic from getUnvalidatedArchivedFarmerInputs
    const cropType = await global.highValueCropsModels.B_crop_types
      .findOne({ farmer_input_id: farmerInput._id })
      .lean();

    if (!cropType) {
      return res.json({
        editRequest,
        result: { farmerInput, cropType: null, cropRecord: null, cropDetails: null }
      });
    }

    let cropRecord = null;
    let cropDetails = null;

    if (cropType.crop_type === 'VEGETABLES, ROOT CROPS AND OTHER INDUSTRIAL CROPS') {
      cropRecord = await global.highValueCropsModels.C_crop_records_indus
        .findOne({ farmer_input_id: farmerInput._id })
        .lean();

      if (cropRecord) {
        if (cropRecord.crop_stage === 'NEWLY PLANTED') {
          cropDetails = await global.highValueCropsModels.D1_crop_indus_new
            .findOne({ record_id: cropRecord._id })
            .lean();
        } else if (cropRecord.crop_stage === 'HARVESTING') {
          cropDetails = await global.highValueCropsModels.D1_crop_indus_harvest
            .findOne({ record_id: cropRecord._id })
            .lean();
        }
      }
    } else {
      cropRecord = await global.highValueCropsModels.C_crop_records_others
        .findOne({ farmer_input_id: farmerInput._id })
        .lean();

      if (cropRecord) {
        if (cropRecord.crop_stage === 'NEWLY PLANTED') {
          cropDetails = await global.highValueCropsModels.D2_bc_other_fct_new
            .findOne({ record_id: cropRecord._id })
            .lean();
        } else if (cropRecord.crop_stage === 'HARVESTING') {
          cropDetails = await global.highValueCropsModels.D2_bc_other_fct_harvest
            .findOne({ record_id: cropRecord._id })
            .lean();
        }
      }
    }

    // 4) Return consolidated payload
    return res.json({
      editRequest,
      result: {
        farmerInput,
        cropType,
        cropRecord,
        cropDetails
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching edit request details.', error: error.message });
  }
};


export const handleConsentForEditRequest = async (req, res) => { // for handling farmer's consent on edit request, either granted or denied
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { editRequestId, consent } = req.body; // consent: 'granted' or 'denied'
    
    if (!editRequestId || !consent) {
      await session.abortTransaction();
      return res.status(400).json({ message: 'Kinakailangan ang editRequestId at consent.' });
    }

    if (!['granted', 'denied'].includes(consent.toLowerCase())) {
      await session.abortTransaction();
      return res.status(400).json({ message: 'Ang consent ay dapat "granted" o "denied" lamang.' });
    }

    // Find the edit request
    const editRequest = await global.highValueCropsModels.EditRequest.findById(editRequestId).session(session);
    if (!editRequest) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Hindi nahanap ang kahilingang pag-edit.' });
    }

    // Find the farmer input
    const farmerInput = await global.highValueCropsModels.A_farmer_inputs.findById(editRequest.farmer_input_id).session(session);
    if (!farmerInput) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Hindi nahanap ang inyong sagot.' });
    }

    // Check if already processed
    if (farmerInput.editConsent.status === 'Granted' || farmerInput.editConsent.status === 'Denied') {
      await session.abortTransaction();
      return res.status(400).json({ message: 'Naproseso na ang kahilingang ito.' });
    }

    const now = new Date();

    if (consent.toLowerCase() === 'granted') {
      // Update farmer input with granted consent
      await global.highValueCropsModels.A_farmer_inputs.findByIdAndUpdate(
        editRequest.farmer_input_id,
        {
          $set: {
            'editConsent.status': 'Granted',
            'editConsent.grantedAt': now,
            'resolved': true
          }
        },
        { session }
      );

      await session.commitTransaction();
      
      return res.status(200).json({
        message: 'Salamat po! Pinayagan ninyo ang pag-edit ng inyong sagot. Maaari na pong isarado ang tab na ito.',
        consent: 'granted'
      });
    } else {
      // Update farmer input with denied consent
      await global.highValueCropsModels.A_farmer_inputs.findByIdAndUpdate(
        editRequest.farmer_input_id,
        {
          $set: {
            'editConsent.status': 'Denied',
            'editConsent.deniedAt': now,
            'resolved': false
          }
        },
        { session }
      );

      await session.commitTransaction();

      return res.status(200).json({
        message: 'Salamat po sa inyong tugon. Hindi ninyo pinayagan ang pag-edit. Maaari na pong isarado ang tab na ito.',
        consent: 'denied'
      });
    }
  } catch (error) {
    await session.abortTransaction();
    console.log(error);
    return res.status(500).json({ message: 'May error sa pagproseso ng inyong consent.', error: error.message });
  } finally {
    session.endSession();
  }
};

export const createValidationScheduleVisit = async (req, res) => { // for scheduling a validation visit for a farmer response
  const session = await mongoose.startSession();
  session.startTransaction();

  let userId = null;

  try {
    // Extract userId from decoded token
    if (req.decodedAuthToken && req.decodedAuthToken.payload) {
      userId = req.decodedAuthToken.payload.userId;
    }

    const { farmerId, initialRemarks, updates, crop_stage } = req.body;

    // Validate required fields
    if (!farmerId || !updates || !crop_stage) {
      await session.abortTransaction();
      return res.status(400).json({ 
        message: 'farmerId, updates, and crop_stage are required.' 
      });
    }

    // Validate that updates object has at least one non-empty value
    const hasValidUpdates = Object.values(updates).some(value => {
      // Check if value exists and is not an empty string
      return value !== null && value !== undefined && value !== '';
    });

    if (!hasValidUpdates) {
      await session.abortTransaction();
      return res.status(400).json({ 
        message: 'At least one valid update value is required.' 
      });
    }

    // Find the farmer input
    const farmerInput = await global.highValueCropsModels.A_farmer_inputs
      .findById(farmerId)
      .session(session);

    if (!farmerInput) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Farmer response not found.' });
    }

    // Check if validation visit is already scheduled
    if (farmerInput.validationVisitDetails?.status === 'Pending') {
      await session.abortTransaction();
      return res.status(400).json({ 
        message: 'Validation visit is already made for this farmer response.' 
      });
    }

    // Check if the response is flagged for review
    if (farmerInput.isForReview !== true) {
      await session.abortTransaction();
      return res.status(400).json({ message: 'Only flagged responses can have validation visits scheduled.' });
    }

    // Find crop type and crop record
    const cropType = await global.highValueCropsModels.B_crop_types
      .findOne({ farmer_input_id: farmerId })
      .session(session)
      .lean();

    if (!cropType) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Crop type not found.' });
    }

    let cropRecord, cropDetails, updateFields = {};

    // Validate and extract update fields based on crop type
    if (cropType.crop_type === 'VEGETABLES, ROOT CROPS AND OTHER INDUSTRIAL CROPS') {
      cropRecord = await global.highValueCropsModels.C_crop_records_indus
        .findOne({ farmer_input_id: farmerId })
        .session(session);

      if (!cropRecord) {
        await session.abortTransaction();
        return res.status(404).json({ message: 'Crop record not found.' });
      }

      if (crop_stage === 'NEWLY PLANTED') {
        cropDetails = await global.highValueCropsModels.D1_crop_indus_new
          .findOne({ record_id: cropRecord._id })
          .session(session);
        
        if ('total_area_planted' in updates) updateFields.total_area_planted = updates.total_area_planted;
      } else if (crop_stage === 'HARVESTING') {
        cropDetails = await global.highValueCropsModels.D1_crop_indus_harvest
          .findOne({ record_id: cropRecord._id })
          .session(session);
        
        if ('total_weight' in updates) updateFields.total_weight = updates.total_weight;
        if ('total_area_harvested' in updates) updateFields.total_area_harvested = updates.total_area_harvested;
      }
    } else {
      cropRecord = await global.highValueCropsModels.C_crop_records_others
        .findOne({ farmer_input_id: farmerId })
        .session(session);

      if (!cropRecord) {
        await session.abortTransaction();
        return res.status(404).json({ message: 'Crop record not found.' });
      }

      if (crop_stage === 'NEWLY PLANTED') {
        cropDetails = await global.highValueCropsModels.D2_bc_other_fct_new
          .findOne({ record_id: cropRecord._id })
          .session(session);
        
        if ('total_trees' in updates) updateFields.total_trees = updates.total_trees;
      } else if (crop_stage === 'HARVESTING') {
        cropDetails = await global.highValueCropsModels.D2_bc_other_fct_harvest
          .findOne({ record_id: cropRecord._id })
          .session(session);
        
        if ('total_weight' in updates) updateFields.total_weight = updates.total_weight;
        if ('trees_harvested' in updates) updateFields.trees_harvested = updates.trees_harvested;
      }
    }

    if (!cropDetails) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Crop details not found.' });
    }

    if (Object.keys(updateFields).length === 0) {
      await session.abortTransaction();
      return res.status(400).json({ message: 'No allowed fields provided for update.' });
    }

    // Build edit request payload
    const editPayload = {
      farmer_input_id: farmerId,
      ...updateFields
    };

    // Create edit request document within transaction
    const editDoc = await global.highValueCropsModels.EditRequest.create([editPayload], { session });

    // Update farmer input within transaction
    await global.highValueCropsModels.A_farmer_inputs.findOneAndUpdate(
      { _id: farmerId },
      {
        editConsent: {
          status: "Pending",
          editRequestId: editDoc[0]._id,
          reason: reason
        },
      },
      { session }
    );

    const reviewLink = `${process.env.CLIENT_URL}/hvc/consent-request/${editDoc[0]._id}`;

    //Send SMS (if this fails, transaction will rollback)
    try {
      if (cropStage === 'newlyPlanted') {
        await sendNewlyPlantedCropCorrectionSMS(phone, farmerName, reviewLink);
      } else {
        await sendHarvestingCropCorrectionSMS(phone, farmerName, reviewLink);
      }
    } catch (smsError) {
      // Rollback transaction if SMS fails
      await session.abortTransaction();
      console.error('SMS sending failed:', smsError);
      return res.status(500).json({ 
        message: 'Failed to send SMS notification to farmer. Edit request was not created.', 
        error: smsError.message 
      });
    }

    // Commit the transaction only if everything succeeded
    await session.commitTransaction();

    await logAction(req, userId, 'SMS_SENT_FOR_EDIT_REQUEST', 'HIGH-VALUE CROPS', `Edit request SMS sent for response: ${farmerId} and created edit request: ${editDoc[0]._id}`, 'SUCCESS');

    return res.json({
      message: 'Edit request recorded. Awaiting farmer consent.',
    });
  } catch (error) {
    // Rollback transaction on any error
    await session.abortTransaction();

    await logAction(req, userId, 'SMS_SENT_FOR_EDIT_REQUEST', 'HIGH-VALUE CROPS', `Error recording edit request: ${error.message}`, 'FAILED');

    console.log(error);
    return res.status(500).json({ message: 'Error recording edit request.', error: error.message });
  } finally {
    session.endSession();
  }
};


//________________________________ DASHBOARD (METRICS / HVC SUPPLY AND MARKET PROFILE REPORT / HVC PRODUCTION REPORT) PAGE ____________________________________


// Get available years from unified farmer record collections
export const getAvailableMetricsYears = async (req, res) => {
  try {
    // Get the specific database connection for high-value-crops
    const db = getHighValueCropsDB();

    // Get all collection names from the correct MongoDB database using the native driver's Db object (makikita parin kahit walang laman yung collection)
    const collections = await db.db.listCollections({}, { nameOnly: true }).toArray(); 
    // Define a case-insensitive regex pattern to extract years from collection names
    const yearPattern = /unified_farmer_records_(\d{4})/i;

    // Extract and validate years
    let years = [];
    for (const collection of collections) {
      const match = collection.name.match(yearPattern);
      if (match) {
        const year = parseInt(match[1], 10);
        // Validate it's a reasonable year (between 2000 and 2100)
        if (year >= 2000 && year <= 2100) {
          years.push(year);
        }
      }
    }

    // Sort years descending (newest first)
    years.sort((a, b) => b - a);



    res.json(years);
  } catch (error) {
    console.error('Error fetching available years:', error);
    res.status(500).json({
      message: 'Error fetching available years',
      error: error.message
    });
  }
};


// Get available months for a specific year from unified farmer records
export const getAvailableMonthsForYear = async (req, res) => {
  const { year } = req.params;
  
  if (!year || isNaN(parseInt(year))) {
    return res.status(400).json({ message: 'Valid year parameter is required' });
  }
  
  try {
    const UnifiedFarmerRecordModel = global.getUnifiedFarmerRecordModel(parseInt(year));
    
    // Check if collection exists by trying to count documents
    const recordCount = await UnifiedFarmerRecordModel.countDocuments();
    if (recordCount === 0) {
      return res.json([]);
    }
    
    // Get months from newly planted records (based on plantation_start_date)
    const plantingMonths = await UnifiedFarmerRecordModel.aggregate([
      { 
        $match: { 
          crop_stage: "NEWLY PLANTED",
          plantation_start_date: { $ne: null }
        } 
      },
      {
        $project: {
          month: { $month: "$plantation_start_date" }
        }
      },
      {
        $group: {
          _id: "$month"
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);
    
    // Get months from harvesting records (based on harvest_start_date)
    const harvestingMonths = await UnifiedFarmerRecordModel.aggregate([
      { 
        $match: { 
          crop_stage: "HARVESTING",
          harvest_start_date: { $ne: null }
        } 
      },
      {
        $project: {
          month: { $month: "$harvest_start_date" }
        }
      },
      {
        $group: {
          _id: "$month"
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);
    
    // Combine and deduplicate months
    const allMonths = [...plantingMonths, ...harvestingMonths]
      .map(item => item._id)
      .filter((value, index, self) => self.indexOf(value) === index)
      .sort((a, b) => a - b);
    
    res.json(allMonths);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching available months', error: error.message });
  }
};


// Get metrics data for a specific year and month
export const getMetricsForYearMonth = async (req, res) => {
  const { year, month } = req.params;
  const { farm_location, commodity } = req.query; // Get filters from query parameters

  // Validate year, month can be 0 for "All Months"
  if (!year || isNaN(parseInt(year)) || month === undefined || month === null || isNaN(parseInt(month))) {
    return res.status(400).json({ message: 'Valid year and month (or 0 for all) parameters are required' });
  }

  try {
    const yearNum = parseInt(year);
    const monthNum = parseInt(month); // monthNum will be 0 for "All Months"

    // Get the appropriate model for this year
    const UnifiedFarmerRecordModel = global.getUnifiedFarmerRecordModel(yearNum);

    // Define month start and end ONLY if a specific month is selected
    let startOfMonth, endOfMonth;
    const isSpecificMonth = monthNum > 0 && monthNum <= 12;

    if (isSpecificMonth) {
      startOfMonth = new Date(yearNum, monthNum - 1, 1);
      endOfMonth = new Date(yearNum, monthNum, 0, 23, 59, 59, 999); // Last day of the month
    }

    // Base filters that will be applied to both queries
    const baseFilters = {};

    // Add optional filters if provided
    if (farm_location) {
      baseFilters.farm_location = farm_location;
    }

    if (commodity) {
      baseFilters.commodity = commodity;
    }

    // 1. Newly Planted Metrics
    const newlyPlantedFilter = {
      ...baseFilters,
      crop_stage: "NEWLY PLANTED",
    };

    // Add date range filter only if a specific month is selected
    if (isSpecificMonth) {
      newlyPlantedFilter.$or = [
        { plantation_start_date: { $gte: startOfMonth, $lte: endOfMonth } },
        { plantation_end_date: { $gte: startOfMonth, $lte: endOfMonth } },
        {
          plantation_start_date: { $lt: startOfMonth },
          plantation_end_date: { $gt: endOfMonth }
        }
      ];
    } else {
      // For "All Months", ensure plantation dates exist within the year (implicitly handled by model)
      newlyPlantedFilter.plantation_start_date = { $ne: null }; // Or some basic check if needed
    }


    // Get unique farmers count who planted
    const newlyPlantedFarmersResult = await UnifiedFarmerRecordModel.aggregate([
      { $match: newlyPlantedFilter },
      { $group: { _id: "$farmer_account_id" } },
      { $count: "count" }
    ]);

    // Calculate total area planted
    const newlyPlantedAreaResult = await UnifiedFarmerRecordModel.aggregate([
      { $match: newlyPlantedFilter },
      {
        $group: {
          _id: null,
          totalAreaPlanted: {
            $sum: {
              $cond: [
                { $gt: [{ $ifNull: ["$total_area_planted", 0] }, 0] },
                "$total_area_planted",
                { $ifNull: ["$total_area_trees_planted", 0] }
              ]
            }
          }
        }
      }
    ]);

    // 2. Harvesting Metrics
    const harvestingFilter = {
      ...baseFilters,
      crop_stage: "HARVESTING",
    };

    // Add date range filter only if a specific month is selected
    if (isSpecificMonth) {
      harvestingFilter.$or = [
        { harvest_start_date: { $gte: startOfMonth, $lte: endOfMonth } },
        { harvest_end_date: { $gte: startOfMonth, $lte: endOfMonth } },
        {
          harvest_start_date: { $lt: startOfMonth },
          harvest_end_date: { $gt: endOfMonth }
        }
      ];
    } else {
       // For "All Months", ensure harvest dates exist within the year (implicitly handled by model)
      harvestingFilter.harvest_start_date = { $ne: null }; // Or some basic check if needed
    }


    // Get unique farmers count who harvested
    const harvestingFarmersResult = await UnifiedFarmerRecordModel.aggregate([
      { $match: harvestingFilter },
      { $group: { _id: "$farmer_account_id" } },
      { $count: "count" }
    ]);

    // Calculate total area harvested and volume production
    const harvestingMetricsResult = await UnifiedFarmerRecordModel.aggregate([
      { $match: harvestingFilter },
      {
        $group: {
          _id: null,
          totalAreaHarvested: {
            $sum: {
              $cond: [
                { $gt: [{ $ifNull: ["$total_area_harvested", 0] }, 0] },
                "$total_area_harvested",
                { $ifNull: ["$total_area_trees_harvested", 0] }
              ]
            }
          },
          totalVolumeProduction: { $sum: { $ifNull: ["$total_weight", 0] } }
        }
      }
    ]);

    // Extract the values (with fallbacks to 0 if no data)
    const newlyPlantedFarmers = newlyPlantedFarmersResult.length > 0 ? newlyPlantedFarmersResult[0].count : 0;
    const areaPlanted = newlyPlantedAreaResult.length > 0 ? newlyPlantedAreaResult[0].totalAreaPlanted : 0;
    const harvestingFarmers = harvestingFarmersResult.length > 0 ? harvestingFarmersResult[0].count : 0;
    const areaHarvested = harvestingMetricsResult.length > 0 ? harvestingMetricsResult[0].totalAreaHarvested : 0;
    const volumeProduction = harvestingMetricsResult.length > 0 ? harvestingMetricsResult[0].totalVolumeProduction : 0;

    // Prepare the response
    const response = {
      filters: {
        year: yearNum,
        month: isSpecificMonth ? monthNum : null, // Indicate null month for "All Months"
        farm_location: farm_location || null,
        commodity: commodity || null
      },
      newlyPlanted: {
        farmers: newlyPlantedFarmers,
        areaPlanted: areaPlanted
      },
      harvesting: {
        farmers: harvestingFarmers,
        areaHarvested: areaHarvested,
        volumeProduction: volumeProduction
      }
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching metrics:', error);
    res.status(500).json({ message: 'Error fetching metrics', error: error.message });
  }
};











