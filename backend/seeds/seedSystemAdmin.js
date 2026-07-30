import bcrypt from 'bcryptjs';

export const seedSystemAdmin = async (models, options = {}) => {
  console.log('Seeding System Admin database...');
  const { SystemAdminAccount } = models;

  if (options.clear) {
    await SystemAdminAccount.deleteMany({});
    console.log('  Cleared existing System_Admin_Account documents.');
  }

  const hashedPassword = await bcrypt.hash('Password123!', 10);

  const admins = [
    {
      first_name: 'Super',
      last_name: 'Admin',
      middle_name: 'Agri',
      email: 'admin@agritrack.online',
      phone: '09170000000',
      password: hashedPassword,
      is2FAEnabled: false,
      isLocked: false,
      isArchived: false,
      createdAt: new Date(),
    },
    {
      first_name: 'System',
      last_name: 'Overseer',
      middle_name: 'M',
      email: 'sysadmin@agritrack.online',
      phone: '09170000001',
      password: hashedPassword,
      is2FAEnabled: false,
      isLocked: false,
      isArchived: false,
      createdAt: new Date(),
    }
  ];

  const createdAdmins = [];
  for (const adminData of admins) {
    const existing = await SystemAdminAccount.findOne({ email: adminData.email });
    if (!existing) {
      const created = await SystemAdminAccount.create(adminData);
      createdAdmins.push(created);
    } else {
      createdAdmins.push(existing);
    }
  }

  console.log(`  Seeded ${createdAdmins.length} System Admin accounts.`);
  return createdAdmins;
};
