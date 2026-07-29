import bcrypt from 'bcryptjs';

export const BARANGAYS = [
  'Poblacion',
  'San Jose',
  'Santa Cruz',
  'San Isidro',
  'Santo Tomas',
  'Tubod',
  'Katipunan',
  'New Visayas',
  'Esperanza',
  'Buenavista'
];

export const seedGlobal = async (models, options = {}) => {
  console.log('Seeding Global database...');
  const { FarmerAccount, EmployeeAccount, Counter, GranularLog } = models;

  if (options.clear) {
    await FarmerAccount.deleteMany({});
    await EmployeeAccount.deleteMany({});
    await Counter.deleteMany({});
    await GranularLog.deleteMany({});
    console.log('  Cleared existing Global DB collections.');
  }

  const hashedPassword = await bcrypt.hash('Password123!', 10);

  // 1. Seed Counters
  await Counter.findOneAndUpdate(
    { _id: 'farmerId' },
    { $set: { seq: 50 } },
    { upsert: true, new: true }
  );

  // 2. Seed Employee Accounts
  const employeesData = [
    {
      first_name: 'HVC',
      last_name: 'Manager',
      middle_name: 'A',
      email: 'hvcm@agritrack.online',
      phone: '09181111111',
      office_position: 'LPMS',
      roles: ['HVCM'],
      password: hashedPassword,
      is2FAEnabled: false,
      isLocked: false,
      createdAt: new Date(),
    },
    {
      first_name: 'HVC',
      last_name: 'Staff',
      middle_name: 'B',
      email: 'hvcs@agritrack.online',
      phone: '09182222222',
      office_position: 'LPMS',
      roles: ['HVCS'],
      password: hashedPassword,
      is2FAEnabled: false,
      isLocked: false,
      createdAt: new Date(),
    },
    {
      first_name: 'Machinery',
      last_name: 'Manager',
      middle_name: 'C',
      email: 'mim@agritrack.online',
      phone: '09183333333',
      office_position: 'ANMS',
      roles: ['MIM'],
      password: hashedPassword,
      is2FAEnabled: false,
      isLocked: false,
      createdAt: new Date(),
    },
    {
      first_name: 'Machinery',
      last_name: 'Staff',
      middle_name: 'D',
      email: 'mis@agritrack.online',
      phone: '09184444444',
      office_position: 'RTSS',
      roles: ['MIS'],
      password: hashedPassword,
      is2FAEnabled: false,
      isLocked: false,
      operatorLicenses: [
        {
          licenseNumber: 'LIC-2024-001',
          licenseType: '4 Wheel Tractor & Rotovator',
          issuedDate: new Date('2024-01-15'),
          expiryDate: new Date('2027-01-15'),
          allowedMachineryTypes: [],
          isActive: true,
          issuedBy: 'Land Transportation & Agricultural Office',
          notes: 'Heavy machinery certified'
        }
      ],
      createdAt: new Date(),
    },
    {
      first_name: 'DocTrack',
      last_name: 'Manager',
      middle_name: 'E',
      email: 'dmm@agritrack.online',
      phone: '09185555555',
      office_position: 'CFS',
      roles: ['DMM'],
      password: hashedPassword,
      is2FAEnabled: false,
      isLocked: false,
      createdAt: new Date(),
    },
    {
      first_name: 'DocTrack',
      last_name: 'Staff',
      middle_name: 'F',
      email: 'dms@agritrack.online',
      phone: '09186666666',
      office_position: 'CFS',
      roles: ['DMS'],
      password: hashedPassword,
      is2FAEnabled: false,
      isLocked: false,
      createdAt: new Date(),
    }
  ];

  const seededEmployees = [];
  for (const empData of employeesData) {
    const existing = await EmployeeAccount.findOne({ email: empData.email });
    if (!existing) {
      const created = await EmployeeAccount.create(empData);
      seededEmployees.push(created);
    } else {
      seededEmployees.push(existing);
    }
  }

  // 3. Seed Farmer Accounts
  const firstNames = ['Antonio', 'Bernardo', 'Carlos', 'Danilo', 'Eduardo', 'Francisco', 'Gabriel', 'Hernan', 'Ignacio', 'Jose'];
  const lastNames = ['Garcia', 'Mendoza', 'Torres', 'Ramos', 'Flores', 'Castillo', 'Villanueva', 'Bautista', 'Cruz', 'Morales'];

  const seededFarmers = [];
  for (let i = 1; i <= 20; i++) {
    const farmerIdStr = `FARM-${String(i).padStart(4, '0')}`;
    const fname = firstNames[(i - 1) % firstNames.length];
    const lname = lastNames[(i - 1) % lastNames.length];
    const brgy = BARANGAYS[(i - 1) % BARANGAYS.length];

    const farmerObj = {
      farmerId: farmerIdStr,
      first_name: fname,
      surname: lname,
      middle_name: 'D',
      farmer_barangay: brgy,
      mobile_number: `0999${String(1000000 + i).slice(1)}`,
      facebook: `${fname.toLowerCase()}.${lname.toLowerCase()}`,
      birthdate: new Date(1975 + (i % 25), (i % 12), 10 + (i % 15)),
      isArchived: false,
    };

    const existing = await FarmerAccount.findOne({ farmerId: farmerIdStr });
    if (!existing) {
      const created = await FarmerAccount.create(farmerObj);
      seededFarmers.push(created);
    } else {
      seededFarmers.push(existing);
    }
  }

  // 4. Seed Granular System Logs
  if (seededEmployees.length > 0) {
    const adminUser = seededEmployees[0];
    const sampleLogs = [
      {
        userId: adminUser._id,
        userType: 'EmployeeAccount',
        action: 'USER_LOGIN',
        module: 'users',
        description: 'User logged in successfully',
        status: 'SUCCESS',
        ip: '127.0.0.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
        createdAt: new Date(Date.now() - 3600000 * 24 * 2),
      },
      {
        userId: adminUser._id,
        userType: 'EmployeeAccount',
        action: 'FARMER_ACCOUNT_CREATED',
        module: 'hvc',
        description: 'Created farmer profile FARM-0001',
        status: 'SUCCESS',
        ip: '127.0.0.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
        createdAt: new Date(Date.now() - 3600000 * 24),
      },
      {
        userId: adminUser._id,
        userType: 'EmployeeAccount',
        action: 'MACHINERY_TYPE_CREATED',
        module: 'machinery',
        description: 'Added machinery type 4-Wheel Tractor',
        status: 'SUCCESS',
        ip: '127.0.0.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
        createdAt: new Date(Date.now() - 3600000 * 12),
      }
    ];

    for (const log of sampleLogs) {
      await GranularLog.create(log);
    }
  }

  console.log(`  Seeded ${seededEmployees.length} employees, ${seededFarmers.length} farmers, and system logs.`);
  return { employees: seededEmployees, farmers: seededFarmers };
};
