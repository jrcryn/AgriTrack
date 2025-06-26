import bcrypt from 'bcryptjs';
import crypto from 'crypto';

import { sendWelcomeEmail } from '../../mailtrap/emails.controller.js';

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

        // naisip ko gawin lang valid for 12 hours yung default password, if failed to comply si user need bumalik kay it to create a new one.
        // TO BE IMPLEMENTED:
        // const defaultPasswordExpiry = Date.now() + 12 * 60 * 60 * 1000;
        const defaultPassword = crypto.randomBytes(8).toString('hex'); 

        const hashedPassword = await bcrypt.hash(defaultPassword, 12);

        const model = role === 'DMS' ? global.docTrackModels.StaffAccount :
                      role === 'DMM' ? global.docTrackModels.ManagerAccount :
                      role === 'MIS' ? global.machineriesModels.StaffAccount :
                      role === 'HVCS' ? global.highValueCropsModels.StaffAccount :
                      role === 'HVCM' ? global.highValueCropsModels.ManagerAccount :
                      null;

        if (!model) {
            return res.status(400).json({ message: 'Invalid account type specified' });
        }

        const newUser = new model({
            name,
            office_position: role === 'DMS' ? office_position : null, // Office position is only required when creating Doc-Track Staff accounts
            email,
            phone,
            password: hashedPassword,
        });
        await newUser.save();
        await sendWelcomeEmail(email, defaultPassword);

        res.status(201).json({ 
            message: 'User registered successfully', 
            user: { // only yung mga kailangan lang pala na ibalik sa client sabi ni ai. Akala ko need pa i-redact yung password or gawing undefined, so pag hindi naka state d2 auto redeacted na pala.
                id: newUser._id,
                name: newUser.name,
                role: role,
                office_position: newUser.office_position
            } 
        }); 

    } catch (error) {
        console.error('Error signing up:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};





