export const createStaffAccount = async (req,res) => {
    const { name, email, phone } = req.body;

    if (!name || !email) {

        return res.status(400).json({ message: 'Name and email are required' });
    }

    if (email || phone) {
        const staffALreadyExists = global.docTrackModels.StaffAccount.findOne({email}, {phone});
        if (staffALreadyExists) {
            return res.status(400).json({ message: 'Staff account already exists' });
        }
    }

    try {
        const newStaffAccount = global.docTrackModels.StaffAccount.create({
            name,
            dept_position: 'doc-trackStaff',
            email,
            phone,
        });
        return res.status(201).json({
            message: 'Staff account created successfully',
            data: newStaffAccount,
          });

    } catch (error) {
        return res.status(500).json({ message: 'Error creating staff account', error });
    }
};

