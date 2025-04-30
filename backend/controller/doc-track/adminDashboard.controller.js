export const createStaffAccount = async (req, res) => {
    const { name, email, phone } = req.body;

    if (!name || !email) {
        return res.status(400).json({ message: 'Name and email are required' });
    }

    try {
        // Check if staff already exists with the same email or phone
        const staffAlreadyExists = await global.docTrackModels.StaffAccount.findOne({
            $or: [
                { email: email },
                { phone: phone }
            ]
        });

        if (staffAlreadyExists) {
            return res.status(400).json({ message: 'Staff account already exists' });
        }

        // Convert phone to number if it's provided as string
        const phoneNumber = phone ? Number(phone) : undefined;x
        
        // Create new staff account
        const newStaffAccount = await global.docTrackModels.StaffAccount.create({
            name,
            dept_position: 'doc-trackStaff',
            email,
            phone: phoneNumber,
        });

        return res.status(201).json({
            message: 'Staff account created successfully',
            data: newStaffAccount,
        });
    } catch (error) {
        return res.status(500).json({ message: 'Error creating staff account', error: error.message });
    }
};