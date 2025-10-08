import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import qrcode from 'qrcode';
import { authenticator } from 'otplib';
import { encrypt, decrypt } from '../../utils/encryption.js';

import { sendWelcomeEmail, sendPasswordResetEmail, sendPasswordResetSuccessEmail } from '../../mailtrap/emails.controller.js';
import { generateTokenAndSetCookie } from '../../utils/generateTokenAndSetCookie.js'
import { generatePreTokenAndSetCookie } from '../../utils/generatePreTokenAndSetCookie.js';

export const register = async (req, res) => {  //system admin level access only (ililipat in the future to a separate route for admin job controllers)
    const { first_name, last_name, middle_name, suffix, email, phone, role, office_position } = req.body;
    try {

        const employee = await global.globalModels.EmployeeAccount.find({ $or: [{ email }, { phone }, { first_name }, { last_name }] });
        if (employee.length > 0) {
            return res.status(400).json({ success: false, message: 'Employee already exists.' });
        }

        if (!first_name || !last_name || !email || !phone || !role || (role === 'DMS' && !office_position)) {
            return res.status(400).json({ success: false, message: 'All fields are required.' });
        }
        const position = ['DMS'].includes(role) ? office_position : null;

        // naisip ko gawin lang valid for 12 hours yung default password, if failed to comply si user need bumalik kay IT to create a new one.
        // TO BE IMPLEMENTED:
        // const defaultPasswordExpiry = Date.now() + 12 * 60 * 60 * 1000;

        const defaultPassword = crypto.randomBytes(8).toString('hex'); 
        const hashedPassword = await bcrypt.hash(defaultPassword, 12);

        await sendWelcomeEmail(email, defaultPassword);
        const newEmployee = await global.globalModels.EmployeeAccount.create({
            first_name,
            last_name,
            middle_name,
            suffix,
            office_position: position, // Office position is only required when creating Doc-Track Staff accounts
            role,
            email,
            phone,
            password: hashedPassword, //for testing purposes, should be changed to hashedPassword in the future
        });
        await newEmployee.save();
        
        res.status(201).json({ 
            message: 'User registered successfully', 
            success: true,
            user: {
                id: newEmployee._id,
                first_name,
                last_name,
                middle_name,
                suffix,
                role,
                office_position
            } 
        }); 

    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'User already exists.' });
        }
        console.error('Error signing up:', error);
        return res.status(500).json({ success: false ,message: 'Internal server error.' });
    }
};


export const checkAuth = async (req, res) => {
    try {

        const user = await global.globalModels.EmployeeAccount.findById(req.decodedAuthToken.payload.userId);

        const role = req.decodedAuthToken.payload.role;

        if (!user || !role) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        res.status(200).json({
            success: true,
            user: {
                id: user._id,
                first_name: user.first_name,
                last_name: user.last_name,
                middle_name: user.middle_name,
                suffix: user.suffix,
                role: role,
                office_position: user.office_position
            },
            availableRoles: user.roles
        });

    } catch (error) {
        console.error('Error checking authentication:', error);
        return res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};

export const switchRole = async (req, res) => {
    try{
        const { targetRole } = req.body;
        if (!targetRole) {
            return res.status(400).json({success: false, message: 'Target role is not found.'})
        };

        const user = await global.globalModels.EmployeeAccount.findById(req.decodedAuthToken.payload.userId);

        if (!user) {
            return res.status(400).json({success: false, message: 'User not found.'})
        };

        const targetAccount = await global.globalModels.EmployeeAccount.findOne({ _id: user._id, email: user.email, roles: targetRole });
        if (!targetAccount) {
            return res.status(404).json({success: false, message: 'You don\'t have access to this role or role does not exist.'})
        };

        generateTokenAndSetCookie(res, targetAccount._id, targetRole);

        return res.status(200).json({
            success: true,
            message: 'Role switched.',
            user: {
                id: targetAccount._id,
                first_name: targetAccount.first_name,
                last_name: targetAccount.last_name,
                middle_name: targetAccount.middle_name,
                suffix: targetAccount.suffix,
                role: targetRole,
                office_position: targetAccount.office_position
            }
        });


    } catch (error) {
        return res.status(500).json({success: false, message: 'Error switching roles.'})
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'All fields are required.'})
        }

        const user = await global.globalModels.EmployeeAccount.findOne({ email }) 
        if (!user) {
            return res.status(404).json({ success: false, message: 'Invalid credentials.' });
        }

        if (user.isLocked) {
            return res.status(403).json({ success: false, message: 'Account locked. Contact IT support to regain access.' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        //const isPasswordValid = (password === user.password) ? true : false; // for testing purposes, this will be changed to bcrypt.compare in the future

        if (!isPasswordValid) {
            // to avoid race conditions, suggestion ni ai, kasi atomic sya imbis na mag hahanap, modify then save.
            await user.updateOne({
                $inc: { 'failedLoginAttempts.count': 1 }, //incremment
                $set: { 'failedLoginAttempts.lastAttempt': Date.now() } //set
            });

            if (user.failedLoginAttempts.count >= 11) {
                user.isLocked = true;
                await user.save();
                return res.status(403).json({ success: false, message: 'Account is now locked due to multiple failed login attempts. Contact IT support to regain access.' });
            }

            const delay = Math.min(user.failedLoginAttempts.count * 1000, 10000); // up to 10s
            await new Promise(res => setTimeout(res, delay));

            return res.status(401).json({ success: false, message: 'Invalid credentials.'})
        }

        user.failedLoginAttempts = { count: 0, lastAttempt: null };
        await user.save();

        generatePreTokenAndSetCookie(res, user._id);

        if(!user.is2FAEnabled) {
            return res.status(401).json({ 
                success: false, 
                message: 'You are required to set up 2FA first.',
                userId: user._id, //  redirect to setup 2fa page send userId for 2FA setup
            });
        };
        
        res.status(200).json({
            success: true,
            message: 'Login successful.',
            userId: user._id // redirect to 2fa verification page send userId too
        });

    } catch (error) {
        console.error('Error logging in:', error);
        return res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};

export const generate2FASecret = async (req, res) => {
    const { userId } = req.body;

    try {
        const user = await global.globalModels.EmployeeAccount.findById( userId );
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        // if (user.is2FAEnabled) {
        //     return res.status(400).json({ success: false, message: '2FA is already enabled for this user.' });
        // }; //hindi na need since need ng user Id para makapunta sa page ng 2FA setup, pero pag may nag report na bug, ito gagamitin pang ayos

        if (user.twoFASecret && user.twoFAQRCode) { // if user already has a generated 2FA secret and QR code
            return res.status(200).json({ 
                success: true,
                qr: decrypt(user.twoFAQRCode),
                secret: decrypt(user.twoFASecret),
                userId: user._id 
            });
        };

        const secret = authenticator.generateSecret();
        const otpauth = authenticator.keyuri(user.email, 'AgriTrack', secret);
        const qr = await qrcode.toDataURL(otpauth);
        
        user.twoFASecret = encrypt(secret);
        user.is2FAEnabled = false;
        user.twoFAQRCode = encrypt(qr); 
        await user.save();

        res.status(200).json({
            success: true,
            message: '2FA secret generated successfully.',
            qr,
            secret,
            userId: user._id
        });

    } catch (error) {
        console.error('Error generating 2FA secret:', error);
        return res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};

export const verify2FA = async (req, res) => {
    const { token, userId } = req.body;

    try {

        const user = await global.globalModels.EmployeeAccount.findById(userId);
        if (user.isLocked) {
            return res.status(403).json({ success: false, message: 'Account locked. Contact IT support to regain access.' });
        }

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        if (!user.twoFASecret) {
            return res.status(400).json({ success: false, message: '2FA is not enabled for this user.' });
        }

        const decryptedSecret = decrypt(user.twoFASecret);

        const isValid = authenticator.verify({ 
            token,
            secret: decryptedSecret
        });

        const activeRole = user.roles[0]; // if activeRole is not set, default to the first role in the roles array

        if (!isValid) {

            await user.updateOne({
                $inc: { 'failedOTPVerifications.count': 1 }, // increment failed attempts
                $set: { 'failedOTPVerifications.lastAttempt': Date.now() } // set last attempt time
            });

            if (user.failedOTPVerifications.count >= 11) {
                user.isLocked = true;
                await user.save();
                return res.status(403).json({ success: false, message: 'Account is now locked due to multiple failed 2FA attempts. Contact IT support to regain access.' });
            }

            const delay = Math.min(user.failedOTPVerifications.count * 1000, 10000); // up to 10s
            await new Promise(res => setTimeout(res, delay));
            
            return res.status(400).json({ success: false, message: 'Invalid 2FA token.' });
        }

        user.is2FAEnabled = true;
        user.lastLogin = Date.now();
        user.failedOTPVerifications = { count: 0, lastAttempt: null };
        await user.save();

        res.clearCookie('preAuthToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production' ? true : false, // Set to true in production for secure cookies
            sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Strict', // Use 'None' for cross-site cookies in production, 'Strict' for local development
            path: '/' //cookie is cleared for the entire domain
        }); 
        generateTokenAndSetCookie(res, user._id, activeRole);

        res.status(200).json({
            success: true,
            message: '2FA verified successfully.', 
            user: {
                id: user._id,
                name: user.name,
                role: user.role,
                office_position: user.office_position
            }
        });

    } catch (error) {
        console.error('Error verifying 2FA:', error);
        return res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};

export const logout = async (req, res) => {
    try {
        res.clearCookie('authToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production' ? true : false, // Set to true in production for secure cookies
            sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Strict', // Use 'None' for cross-site cookies in production, 'Strict' for local development
            path: '/' //cookie is cleared for the entire domain
        });
        res.status(200).json({ success: true, message: 'Logout successful.' });
    } catch (error) {
        console.error('Error logging out:', error);
        return res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};

export const forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {   
        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required.'})
        }

        let user = await global.docTrackModels.StaffAccount.findOne({ email }) ||
                     await global.docTrackModels.ManagerAccount.findOne({ email }) ||
                     await global.machineriesModels.StaffAccount.findOne({ email }) ||
                     await global.highValueCropsModels.StaffAccount.findOne({ email }) ||
                     await global.highValueCropsModels.ManagerAccount.findOne({ email });

        if (!user) {
            return res.status(404).json({ success: false, message: 'We cannot find your email.' });
        }

        const resetPasswordToken = crypto.randomBytes(32).toString('hex');
        const resetPasswordExpiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

        await sendPasswordResetEmail(email, `${process.env.CLIENT_URL}/auth/reset-password/${resetPasswordToken}`); 

        user.resetPasswordToken = resetPasswordToken;
        user.resetPasswordExpiresAt = resetPasswordExpiresAt;
        await user.save();

        

        res.status(200).json({
            success: true,
            message: 'Reset email sent. If not received immediately, check spam or wait a few minutes before requesting again.'
        });

    } catch (error) {
        console.error('Error resetting password:', error);
        return res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};

export const resetPassword = async (req, res) => {
    const { token } = req.params;
    const { newPassword } = req.body;

    try {
        let user = await global.docTrackModels.StaffAccount.findOne({ resetPasswordToken: token, resetPasswordExpiresAt: { $gt: Date.now() } }) ||
                     await global.docTrackModels.ManagerAccount.findOne({ resetPasswordToken: token, resetPasswordExpiresAt: { $gt: Date.now() } }) ||
                     await global.machineriesModels.StaffAccount.findOne({ resetPasswordToken: token, resetPasswordExpiresAt: { $gt: Date.now() } }) ||
                     await global.highValueCropsModels.StaffAccount.findOne({ resetPasswordToken: token, resetPasswordExpiresAt: { $gt: Date.now() } }) ||
                     await global.highValueCropsModels.ManagerAccount.findOne({ resetPasswordToken: token, resetPasswordExpiresAt: { $gt: Date.now() } });

        if (!user) {
            return res.status(404).json({ success: false, message: 'Invalid or expired reset token.' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 12);

        user.password = hashedPassword;
        user.resetPasswordToken = undefined;  
        user.resetPasswordExpiresAt = undefined; 
        await user.save();

        await sendPasswordResetSuccessEmail(user.email);
        
        res.status(200).json({
            success: true,
            message: 'Password reset successful.'
        });

    } catch (error) {
        console.error('Error resetting password:', error);
        return res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};




