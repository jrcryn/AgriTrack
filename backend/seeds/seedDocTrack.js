export const seedDocTrack = async (models, employees, options = {}) => {
  console.log('Seeding Document Tracking database...');
  const {
    Document,
    DocumentLifeCycle,
    Counter,
    ArchivedDocuments,
    ReleasedDocuments,
    DisposedDocuments,
  } = models;

  if (options.clear) {
    await Document.deleteMany({});
    await DocumentLifeCycle.deleteMany({});
    await Counter.deleteMany({});
    if (ArchivedDocuments) await ArchivedDocuments.deleteMany({});
    if (ReleasedDocuments) await ReleasedDocuments.deleteMany({});
    if (DisposedDocuments) await DisposedDocuments.deleteMany({});
    console.log('  Cleared existing DocTrack DB collections.');
  }

  // 1. Counter
  await Counter.findOneAndUpdate({ _id: 'docRefNumber' }, { seq: 100 }, { upsert: true, new: true });

  // 2. Document types/templates
  const documentTypesData = [
    {
      documentName: 'Agricultural Subsidy Application',
      documentCode: 'ASA-001',
      disposalMethod: 'Shredding',
      retentionPeriod: 60, // 5 years
    },
    {
      documentName: 'Machinery Rental Voucher',
      documentCode: 'MRV-002',
      disposalMethod: 'Recycling / Digital Archive',
      retentionPeriod: 36, // 3 years
    },
    {
      documentName: 'High Value Crops Survey Report',
      documentCode: 'HVC-003',
      disposalMethod: 'Permanent Archive',
      retentionPeriod: 120, // 10 years
    },
    {
      documentName: 'Barangay Agricultural Resolution',
      documentCode: 'BAR-004',
      disposalMethod: 'Incineration',
      retentionPeriod: 24, // 2 years
    },
  ];

  const seededDocTypes = [];
  for (const docData of documentTypesData) {
    const created = await Document.create(docData);
    seededDocTypes.push(created);
  }

  // Active employees sample for handling documents
  const docManager = employees.find(e => e.roles?.includes('DMM') || e.email.includes('dmm')) || employees[0];
  const staffUser = employees.find(e => e.roles?.includes('DMS') || e.email.includes('dms')) || employees[0];

  // 3. Document Life Cycles (Tracked Active Documents)
  const sampleLifeCycles = [
    {
      docType: seededDocTypes[0],
      name: 'Farmer Fertilizer Assistance Request 2026',
      originatingOffice: 'CFS',
      priority: 'Urgent',
      refNumber: 'DOC-2026-0001',
      details: 'Request for organic fertilizer distribution for 50 farmers in Brgy. Poblacion.',
      status: 'Forwarded',
    },
    {
      docType: seededDocTypes[1],
      name: 'Tractor Repair and Maintenance Clearance',
      originatingOffice: 'ANMS',
      priority: 'Medium',
      refNumber: 'DOC-2026-0002',
      details: 'Budget clearance request for tractor unit engine overhaul.',
      status: 'Received/Work on Progress',
    },
    {
      docType: seededDocTypes[2],
      name: 'Q2 High-Value Crop Production Audit',
      originatingOffice: 'LPMS',
      priority: 'Low',
      refNumber: 'DOC-2026-0003',
      details: 'Quarterly harvest yield and sales summary for industrial crops.',
      status: 'Document Created',
    },
    {
      docType: seededDocTypes[3],
      name: 'Irrigation Maintenance Endorsement',
      originatingOffice: 'RTSS',
      priority: 'Urgent',
      refNumber: 'DOC-2026-0004',
      details: 'Endorsement letter for communal irrigation restoration.',
      status: 'Archived',
    }
  ];

  let activeCount = 0;
  let archivedCount = 0;

  for (const item of sampleLifeCycles) {
    const qrData = JSON.stringify({
      refNumber: item.refNumber,
      documentCode: item.docType.documentCode,
      name: item.name,
      originatingOffice: item.originatingOffice,
    });

    const lifeCycleHistory = [
      {
        action: 'Document Created',
        performedBy: {
          userId: staffUser._id,
          first_name: staffUser.first_name,
          last_name: staffUser.last_name,
          role: staffUser.roles ? staffUser.roles[0] : 'Staff',
          office_position: item.originatingOffice,
          email: staffUser.email,
          phone: staffUser.phone,
        },
        timeStamp: new Date(Date.now() - 3600000 * 48),
      }
    ];

    if (item.status === 'Forwarded' || item.status === 'Received/Work on Progress' || item.status === 'Archived') {
      lifeCycleHistory.push({
        action: 'Forwarded',
        performedBy: {
          userId: staffUser._id,
          first_name: staffUser.first_name,
          last_name: staffUser.last_name,
          role: staffUser.roles ? staffUser.roles[0] : 'Staff',
          office_position: item.originatingOffice,
          email: staffUser.email,
          phone: staffUser.phone,
        },
        forwardDetails: {
          userId: docManager._id,
          first_name: docManager.first_name,
          last_name: docManager.last_name,
          role: docManager.roles ? docManager.roles[0] : 'Manager',
          office_position: 'CFS',
          email: docManager.email,
          phone: docManager.phone,
          forwardRemarks: 'For review and approval.',
        },
        timeStamp: new Date(Date.now() - 3600000 * 24),
      });
    }

    if (item.status === 'Received/Work on Progress') {
      lifeCycleHistory.push({
        action: 'Received/Work on Progress',
        performedBy: {
          userId: docManager._id,
          first_name: docManager.first_name,
          last_name: docManager.last_name,
          role: docManager.roles ? docManager.roles[0] : 'Manager',
          office_position: 'CFS',
          email: docManager.email,
          phone: docManager.phone,
        },
        timeStamp: new Date(Date.now() - 3600000 * 12),
      });
    }

    const docLifeCycleRecord = {
      documentId: item.docType._id,
      documentName: item.docType.documentName,
      documentCode: item.docType.documentCode,
      documentNameText: item.name,
      originatingOffice: item.originatingOffice,
      priority: item.priority,
      refNumber: item.refNumber,
      docQRData: qrData,
      details: item.details,
      lifeCycle: lifeCycleHistory,
      currentHandler: {
        first_name: docManager.first_name,
        last_name: docManager.last_name,
        role: docManager.roles ? docManager.roles[0] : 'Manager',
        office_position: 'CFS',
        email: docManager.email,
        phone: docManager.phone,
      }
    };

    if (item.status === 'Archived' && ArchivedDocuments) {
      await ArchivedDocuments.create(docLifeCycleRecord);
      archivedCount++;
    } else {
      await DocumentLifeCycle.create(docLifeCycleRecord);
      activeCount++;
    }
  }

  console.log(`  Seeded ${documentTypesData.length} document types, ${activeCount} active tracking documents, and ${archivedCount} archived documents.`);
};
