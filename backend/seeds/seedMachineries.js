export const seedMachineries = async (models, farmers, employees, options = {}) => {
  console.log('Seeding Machineries database...');
  const {
    MachineriesType,
    MachineriesUnit,
    TicketRequest,
    ExtensionTicket,
    WeeklySchedule,
    TripTicket,
    FormStatus,
    TRCounter,
    SCounter,
    ArchivedTicketRequest,
    IncidentReport,
    MachinePhysicalCounting,
  } = models;

  if (options.clear) {
    await MachineriesType.deleteMany({});
    await MachineriesUnit.deleteMany({});
    await TicketRequest.deleteMany({});
    if (ExtensionTicket) await ExtensionTicket.deleteMany({});
    await WeeklySchedule.deleteMany({});
    await TripTicket.deleteMany({});
    await FormStatus.deleteMany({});
    if (TRCounter) await TRCounter.deleteMany({});
    if (SCounter) await SCounter.deleteMany({});
    if (ArchivedTicketRequest) await ArchivedTicketRequest.deleteMany({});
    if (IncidentReport) await IncidentReport.deleteMany({});
    if (MachinePhysicalCounting) await MachinePhysicalCounting.deleteMany({});
    console.log('  Cleared existing Machineries DB collections.');
  }

  // 1. FormStatus & Counters
  await FormStatus.findOneAndUpdate({}, { formStatus: true }, { upsert: true, new: true });
  if (TRCounter) await TRCounter.findOneAndUpdate({ _id: 'trCounter' }, { seq: 100 }, { upsert: true, new: true });
  if (SCounter) await SCounter.findOneAndUpdate({ _id: 'sCounter' }, { seq: 50 }, { upsert: true, new: true });

  // 2. Machine Types
  const machineTypesData = [
    {
      ownerName: 'Municipal Agriculture Office',
      ownerType: 'LGU Owned',
      equipmentType: '4-Wheel Tractor with Rotovator',
      ratedCapacity: '75 HP',
      status: 'Available',
    },
    {
      ownerName: 'Municipal Agriculture Office',
      ownerType: 'LGU Owned',
      equipmentType: 'Rice Combine Harvester',
      ratedCapacity: '60 HP',
      status: 'Available',
    },
    {
      ownerName: 'Municipal Agriculture Office',
      ownerType: 'LGU Owned',
      equipmentType: 'Walking Hand Tractor (Kuliglig)',
      ratedCapacity: '12 HP',
      status: 'Available',
    },
    {
      ownerName: 'Provincial Department of Agriculture',
      ownerType: 'Provincial Owned',
      equipmentType: 'Heavy Water Pump System',
      ratedCapacity: '400 GPM',
      status: 'Available',
    },
  ];

  const seededTypes = [];
  for (const tData of machineTypesData) {
    const created = await MachineriesType.create(tData);
    seededTypes.push(created);
  }

  // 3. Machine Units
  const seededUnits = [];
  for (let i = 0; i < seededTypes.length; i++) {
    const mType = seededTypes[i];
    for (let u = 1; u <= 2; u++) {
      const unit = await MachineriesUnit.create({
        machineryTypeId: mType._id,
        unitNumber: `UNIT-${String(i + 1).padStart(2, '0')}-${u}`,
        engineBrand: u % 2 === 0 ? 'Kubota' : 'Yanmar',
        engineHorsepower: mType.ratedCapacity,
        modeOfAcquisition: 'Government Donation',
        costOfAcquisition: '1200000',
        yearAcquired: '2022',
        condition: 'Functional',
        status: u === 1 ? 'Available' : 'In Use',
        remarks: 'Operational and clean service history',
      });
      seededUnits.push(unit);
    }
  }

  // Find operator employee if available
  const operatorEmp = employees.find(e => e.roles?.includes('Operator') || e.office_position === 'RTSS') || employees[0];

  // 4. Ticket Requests
  const seededTickets = [];
  for (let i = 0; i < Math.min(farmers.length, 10); i++) {
    const farmer = farmers[i];
    const mType = seededTypes[i % seededTypes.length];
    const mUnit = seededUnits[i % seededUnits.length];
    const refNum = `TR-2026-${String(100 + i).padStart(4, '0')}`;
    const statuses = ['Pending', 'Scheduled', 'Ongoing', 'Completed'];
    const currentStatus = statuses[i % statuses.length];

    const ticket = await TicketRequest.create({
      requestorFarmer: {
        requestorFarmerId: farmer._id,
        farmerId: farmer.farmerId,
        surname: farmer.surname,
        first_name: farmer.first_name,
        middle_name: farmer.middle_name || '',
      },
      requestedMachineType: {
        requestedMachineTypeId: mType._id,
        ownerName: mType.ownerName,
        ownerType: mType.ownerType,
        equipmentType: mType.equipmentType,
        ratedCapacity: mType.ratedCapacity,
      },
      refNumber: refNum,
      barangay: farmer.farmer_barangay,
      estimatedArea: 2.5 + (i * 0.5),
      dateRequested: new Date(Date.now() - 3600000 * 24 * (i + 1)),
      status: currentStatus,
      assignedDate: currentStatus !== 'Pending' ? new Date(Date.now() + 3600000 * 24 * i) : undefined,
      assignedMachineUnit: currentStatus !== 'Pending' ? {
        assignedMachineUnitId: mUnit._id,
        unitNumber: mUnit.unitNumber,
        engineBrand: mUnit.engineBrand,
        engineHorsepower: mUnit.engineHorsepower,
      } : undefined,
      assignedOperator: currentStatus !== 'Pending' && operatorEmp ? {
        assignedOperatorId: operatorEmp._id,
        first_name: operatorEmp.first_name,
        last_name: operatorEmp.last_name,
        email: operatorEmp.email,
        phone: operatorEmp.phone,
      } : undefined,
      remarks: 'Scheduled for rotavation of rice field.',
    });
    seededTickets.push(ticket);
  }

  // 5. Weekly Schedule
  const scheduledTickets = seededTickets.filter(t => t.status === 'Scheduled' || t.status === 'Ongoing' || t.status === 'Completed');
  if (scheduledTickets.length > 0) {
    await WeeklySchedule.create({
      weekStart: new Date(Date.now() - 3600000 * 24 * 3),
      weekEnd: new Date(Date.now() + 3600000 * 24 * 4),
      refNumber: 'SCHED-2026-W30',
      status: 'In Progress',
      ticketRequests: scheduledTickets.map(t => ({
        ticketRequestId: t._id,
        assignedDate: t.assignedDate || new Date(),
      }))
    });
  }

  // 6. Trip Tickets
  const completedTickets = seededTickets.filter(t => t.status === 'Completed' || t.status === 'Ongoing');
  for (const cTicket of completedTickets) {
    const farmer = farmers.find(f => f._id.toString() === cTicket.requestorFarmer.requestorFarmerId.toString()) || farmers[0];
    const mUnit = seededUnits[0];

    await TripTicket.create({
      ticketRequest: cTicket._id,
      requestorFarmer: farmer._id,
      utilizedMachineUnit: mUnit._id,
      workedOperator: operatorEmp ? operatorEmp._id : undefined,
      barangay: cTicket.barangay,
      dateServiced: new Date(),
      areaServiced: cTicket.estimatedArea,
      status: 'Completed',
    });
  }

  // 7. Incident Reports
  if (IncidentReport && seededUnits.length > 0 && operatorEmp) {
    await IncidentReport.create({
      machineUnitId: seededUnits[0]._id,
      unitNumber: seededUnits[0].unitNumber,
      reportedBy: operatorEmp._id,
      operatorName: `${operatorEmp.first_name} ${operatorEmp.last_name}`,
      incidentDate: new Date(Date.now() - 3600000 * 48),
      incidentType: 'Minor Engine Overheating',
      description: 'Radiator coolant low during field operation in Brgy. Poblacion.',
      status: 'Resolved',
      resolutionNotes: 'Coolant refilled and fan belt tightened.',
    }).catch(() => {});
  }

  // 8. Physical Counting
  if (MachinePhysicalCounting && seededUnits.length > 0) {
    await MachinePhysicalCounting.create({
      machineUnitId: seededUnits[0]._id,
      unitNumber: seededUnits[0].unitNumber,
      inspectedDate: new Date(),
      physicalCondition: 'Functional',
      inspectorName: `${employees[0].first_name} ${employees[0].last_name}`,
      remarks: 'Unit inspected and matched inventory records.',
    }).catch(() => {});
  }

  console.log(`  Seeded ${seededTypes.length} machine types, ${seededUnits.length} units, and ${seededTickets.length} ticket requests.`);
};
