import bcrypt from 'bcryptjs';

export const register = async (req, res) => {
    const { name, email, phone, password, role, office_position } = req.body;
    try {

        if (!name || !email || !phone || !password || !role || (role === 'DMS' && !office_position)) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        
        // uAE (userAlreadyExists) can be improved later on to be an array of models tapos for loop na lang?

        const uAEDocTrackStaff = await global.docTrackModels.StaffAccount.findOne({
            $or: [
                { email: email },
                { phone: phone }
            ]
        });
        const uAEDocTrackAdmin = await global.docTrackModels.ManagerAccount.findOne({
            $or: [
                { email: email },
                { phone: phone }
            ]
        });
        const uAEMachineriesStaff = await global.machineriesModels.StaffAccount.findOne({
            $or: [
                { email: email },
                { phone: phone }
            ]
        });
        const uAEHVCStaff = await global.highValueCropsModels.StaffAccount.findOne({
            $or: [
                { email: email },
                { phone: phone }
            ]
        });
        const uAEHVCAdmin = await global.highValueCropsModels.ManagerAccount.findOne({
            $or: [
                { email: email },
                { phone: phone }
            ]
        });
        if (uAEDocTrackStaff || uAEDocTrackAdmin || uAEMachineriesStaff || uAEHVCStaff || uAEHVCAdmin) {
            return res.status(400).json({ message: 'User already exists with this email or phone' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const model = role === 'DMS' ? global.docTrackModels.StaffAccount :
                      role === 'DMM' ? global.docTrackModels.ManagerAccount :
                      role === 'MIS' ? global.machineriesModels.StaffAccount :
                      role === 'HVCS' ? global.highValueCropsModels.StaffAccount :
                      role === 'HVCM' ? global.highValueCropsModels.ManagerAccount :
                      null;

        const newUser = new model({
            name,
            office_position: role === 'DMS' ? office_position : null, // Office position is only required when creating Doc-Track Staff accounts
            email,
            phone,
            password: hashedPassword,
        });
        await newUser.save();
        res.status(201).json({ message: 'User registered successfully', data: newUser });

    } catch (error) {
        console.error('Error signing up:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};



