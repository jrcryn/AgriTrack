import bcrypt from 'bcryptjs';
import crypto from 'crypto';

import { sendWelcomeEmail } from '../../mailtrap/emails.controller.js';
import { generateTokenAndSetCookie } from '../../utils/generateTokenAndSetCookie.js'

export const register = async (req, res) => {  //system admin level access only
    const { name, email, phone, role, office_position } = req.body;
    try {

        if (!name || !email || !phone || !role || (role === 'DMS' && !office_position)) {
            return res.status(400).json({ success: false, message: 'All fields are required.' });
        }

        let userExists = await global.docTrackModels.StaffAccount.findOne({ $or: [{ email: email }, { phone: phone }]}) ||
                           await global.docTrackModels.ManagerAccount.findOne({ $or: [{ email: email }, { phone: phone }]}) ||
                           await global.machineriesModels.StaffAccount.findOne({ $or: [{ email: email }, { phone: phone }]}) ||
                           await global.highValueCropsModels.StaffAccount.findOne({ $or: [{ email: email }, { phone: phone }]}) ||
                           await global.highValueCropsModels.ManagerAccount.findOne({ $or: [{ email: email }, { phone: phone }] });

        if (userExists) {
            return res.status(400).json({ success: false, message: 'User already exists.' });
        }

        // naisip ko gawin lang valid for 12 hours yung default password, if failed to comply si user need bumalik kay IT to create a new one.
        // TO BE IMPLEMENTED:
        // const defaultPasswordExpiry = Date.now() + 12 * 60 * 60 * 1000;
        const defaultPassword = crypto.randomBytes(8).toString('hex'); 

        const hashedPassword = await bcrypt.hash(defaultPassword, 12); // default password sent via email, users are required to change it upon first login

        const model = role === 'DMS' ? global.docTrackModels.StaffAccount :
                      role === 'DMM' ? global.docTrackModels.ManagerAccount :
                      role === 'MIS' ? global.machineriesModels.StaffAccount :
                      role === 'HVCS' ? global.highValueCropsModels.StaffAccount :
                      role === 'HVCM' ? global.highValueCropsModels.ManagerAccount :
                      null;

        if (!model) {
            return res.status(400).json({ success: false, message: 'Invalid account type specified.' });
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

        hashedPassword = undefined; 
        res.status(201).json({ 
            message: 'User registered successfully', 
            success: true,
            user: { // only yung mga kailangan lang pala na ibalik sa client sabi ni ai. Akala ko need pa i-redact yung password or gawing undefined, so pag hindi naka state d2 auto redeacted na pala.
                id: newUser._id,
                name: newUser.name,
                role: role,
                office_position: newUser.office_position
            } 
        }); 

    } catch (error) {
        console.error('Error signing up:', error);
        return res.status(500).json({ success: false ,message: 'Internal server error.' });
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'All fields are required.'})
        }

        const user = await global.docTrackModels.StaffAccount.findOne({ email }) ||
                     await global.docTrackModels.ManagerAccount.findOne({ email }) ||
                     await global.machineriesModels.StaffAccount.findOne({ email }) ||
                     await global.highValueCropsModels.StaffAccount.findOne({ email }) ||
                     await global.highValueCropsModels.ManagerAccount.findOne({ email });

        if (!user) {
            return res.status(404).json({ success: false, message: 'Invalid credentials.' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ success: false, message: 'Invalid credentials.'})
        }

        generateTokenAndSetCookie(res, user._id);

        user.lastLogin = new Date();
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Login successful.',
            user: {
                id: user._id,
                role: user.role,
                office_position: user.office_position,
            }
        });

    } catch (error) {
        console.error('Error logging in:', error);
        return res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};


export const logout = async (req, res) => {
    try {
        res.clearCookie('authToken');
        res.status(200).json({ success: true, message: 'Logout successful.' });
    } catch (error) {
        console.error('Error logging out:', error);
        return res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};



