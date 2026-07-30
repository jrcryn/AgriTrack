import { getUnifiedFarmerRecordModel } from '../models/high-value-crops/hvcModelFactory.js';

export const seedHVC = async (models, farmers, employees, options = {}) => {
  console.log('Seeding High Value Crops database...');
  const {
    A_farmer_inputs,
    B_crop_types,
    C_crop_records_indus,
    C_crop_records_others,
    D1_crop_indus_new,
    D1_crop_indus_harvest,
    D2_bc_other_fct_new,
    D2_bc_other_fct_harvest,
    EditRequest,
    FormStatus,
  } = models;

  if (options.clear) {
    await A_farmer_inputs.deleteMany({});
    await B_crop_types.deleteMany({});
    await C_crop_records_indus.deleteMany({});
    if (C_crop_records_others) await C_crop_records_others.deleteMany({});
    if (D1_crop_indus_new) await D1_crop_indus_new.deleteMany({});
    if (D1_crop_indus_harvest) await D1_crop_indus_harvest.deleteMany({});
    if (D2_bc_other_fct_new) await D2_bc_other_fct_new.deleteMany({});
    if (D2_bc_other_fct_harvest) await D2_bc_other_fct_harvest.deleteMany({});
    await EditRequest.deleteMany({});
    await FormStatus.deleteMany({});
    console.log('  Cleared existing High Value Crops collections.');
  }

  // 1. Form status
  await FormStatus.findOneAndUpdate({}, { formStatus: true }, { upsert: true, new: true });

  // Crop types definition
  const CROP_CATEGORIES = [
    { name: 'Cacao', type: 'Industrial', variety: 'BR25' },
    { name: 'Coffee', type: 'Industrial', variety: 'ROBUSTA' },
    { name: 'Coconut', type: 'Industrial', variety: 'LAGUNA TALL' },
    { name: 'Banana', type: 'Other', variety: 'LAKATAN' },
    { name: 'Mango', type: 'Other', variety: 'CARABAO' },
    { name: 'Rubber', type: 'Industrial', variety: 'PB 260' },
  ];

  let inputCount = 0;
  let cropTypeCount = 0;
  let indusRecordCount = 0;

  for (let i = 0; i < Math.min(farmers.length, 15); i++) {
    const farmer = farmers[i];

    // Create A_farmer_inputs record
    const farmerInput = await A_farmer_inputs.create({
      farmer_account_id: farmer._id,
      farmerId: farmer.farmerId,
      farm_location: farmer.farmer_barangay,
      isValidated: i % 2 === 0,
      isForReview: i % 3 === 0,
      isArchived: false,
      editConsent: {
        status: i % 4 === 0 ? 'Pending' : 'Completed',
        grantedAt: new Date(Date.now() - 3600000 * 48),
        reason: 'Updated harvest yield figures'
      },
      requiredValidationVisit: i % 5 === 0,
      successfullyUpdated: true,
      validationVisitDetails: {
        status: 'Completed',
        completedAt: new Date(Date.now() - 3600000 * 24),
        first_name: 'Maria',
        last_name: 'Santos',
        email: 'hvc.staff@agritrack.online',
        phone: '09182222222',
        initialRemarks: 'Verified farm boundaries and tree count.',
        remarks: 'Approved for official record.',
        isValidationVisitDetailsApproved: true,
      }
    });
    inputCount++;

    // Selected crop for farmer
    const cropChoice = CROP_CATEGORIES[i % CROP_CATEGORIES.length];

    const cropTypeDoc = await B_crop_types.create({
      farmer_input_id: farmerInput._id,
      farmerId: farmer.farmerId,
      crop_type: cropChoice.name,
    });
    cropTypeCount++;

    // Crop stage records
    const stage = i % 2 === 0 ? 'HARVESTING' : 'NEWLY PLANTED';

    const cIndus = await C_crop_records_indus.create({
      farmer_input_id: farmerInput._id,
      farmerId: farmer.farmerId,
      crop_type_id: cropTypeDoc._id,
      crop_type: cropChoice.name,
      crop_variety: cropChoice.variety,
      crop_stage: stage,
    });
    indusRecordCount++;

    // Detail stage records D1_crop_indus_new or D1_crop_indus_harvest
    if (stage === 'NEWLY PLANTED' && D1_crop_indus_new) {
      await D1_crop_indus_new.create({
        farmer_input_id: farmerInput._id,
        farmerId: farmer.farmerId,
        crop_records_indus_id: cIndus._id,
        total_area_planted: 1.5 + (i * 0.5),
        date_planted: new Date(2025, i % 12, 1),
      }).catch(() => {});
    } else if (stage === 'HARVESTING' && D1_crop_indus_harvest) {
      await D1_crop_indus_harvest.create({
        farmer_input_id: farmerInput._id,
        farmerId: farmer.farmerId,
        crop_records_indus_id: cIndus._id,
        total_area_harvested: 2.0 + (i * 0.3),
        total_weight: 1200 + (i * 150),
        harvest_frequency: 'Monthly',
      }).catch(() => {});
    }

    // Edit requests sample
    if (i % 4 === 0) {
      await EditRequest.create({
        farmer_input_id: farmerInput._id,
        total_area_planted: 2.5,
        total_trees: 300,
        total_area_harvested: 2.0,
        trees_harvested: 250,
        total_weight: 1500,
        resolved: false,
      });
    }
  }

  // Seed UnifiedFarmerRecord_2026
  try {
    const UnifiedModel = getUnifiedFarmerRecordModel(2026);
    if (options.clear) {
      await UnifiedModel.deleteMany({});
    }

    for (let i = 0; i < Math.min(farmers.length, 10); i++) {
      const f = farmers[i];
      await UnifiedModel.create({
        farmerId: f.farmerId,
        surname: f.surname,
        first_name: f.first_name,
        middle_name: f.middle_name || '',
        suffix: f.suffix || '',
        farmer_barangay: f.farmer_barangay,
        mobile_number: f.mobile_number,
        farm_location: f.farmer_barangay,
        crops: [
          {
            crop_type: CROP_CATEGORIES[i % CROP_CATEGORIES.length].name,
            crop_variety: CROP_CATEGORIES[i % CROP_CATEGORIES.length].variety,
            crop_stage: i % 2 === 0 ? 'HARVESTING' : 'NEWLY PLANTED',
            total_area_planted: 1.5 + i,
            total_weight: 1000 + i * 200,
          }
        ],
        isValidated: true,
        createdAt: new Date(),
      }).catch(() => {});
    }
    console.log('  Seeded UnifiedFarmerRecord_2026 documents.');
  } catch (err) {
    console.log('  Note on UnifiedFarmerRecord:', err.message);
  }

  console.log(`  Seeded ${inputCount} farmer inputs, ${cropTypeCount} crop types, ${indusRecordCount} crop records.`);
};
