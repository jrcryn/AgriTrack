import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import qrcode from 'qrcode';
import { authenticator } from 'otplib';
import { encrypt, decrypt } from '../../utils/encryption.js';

import { sendWelcomeEmail, sendPasswordResetEmail, sendPasswordResetSuccessEmail } from '../../mailtrap/emails.controller.js';
import { generateTokenAndSetCookie } from '../../utils/generateTokenAndSetCookie.js'

export const register = async (req, res) => {  //system admin level access only (ililipat in the future to a separate route for admin job controllers)
    const { name, email, phone, role, office_position } = req.body;
    try {

        if (!name || !email || !phone || !role || (role === 'DMS' && !office_position)) {
            return res.status(400).json({ success: false, message: 'All fields are required.' });
        }

        const userAlreadyExists = await global.docTrackModels.StaffAccount.findOne({ $or: [{ email: email }, { phone: phone }]}) ||
                   await global.docTrackModels.ManagerAccount.findOne({ $or: [{ email: email }, { phone: phone }]}) ||
                   await global.machineriesModels.StaffAccount.findOne({ $or: [{ email: email }, { phone: phone }]}) ||
                   await global.highValueCropsModels.StaffAccount.findOne({ $or: [{ email: email }, { phone: phone }]}) ||
                   await global.highValueCropsModels.ManagerAccount.findOne({ $or: [{ email: email }, { phone: phone }] });

        if (userAlreadyExists) {
            return res.status(400).json({ success: false, message: 'User already exists.' });
        }

        // naisip ko gawin lang valid for 12 hours yung default password, if failed to comply si user need bumalik kay IT to create a new one.
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
 
        res.status(201).json({ 
            message: 'User registered successfully', 
            success: true,
            user: {
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




export const checkAuth = async (req, res) => {
    try {
        const user = await global.docTrackModels.StaffAccount.findById( req.userId ) ||
                     await global.docTrackModels.ManagerAccount.findById( req.userId ) ||
                     await global.machineriesModels.StaffAccount.findById( req.userId ) ||
                     await global.highValueCropsModels.StaffAccount.findById( req.userId ) ||
                     await global.highValueCropsModels.ManagerAccount.findById( req.userId );

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        res.status(200).json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                office_position: user.office_position
            }
        });

    } catch (error) {
        console.error('Error checking authentication:', error);
        return res.status(500).json({ success: false, message: 'Internal server error.' });
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

        if(!user.is2FAEnabled) {
            return res.status(401).json({ 
                success: false, 
                message: 'You are required to set up 2FA first.',
                userId: user._id, // Also send userId for 2FA setup
            });
        };
        

        res.status(200).json({
            success: true,
            message: 'Login successful.',
            userId: user._id
        });

    } catch (error) {
        console.error('Error logging in:', error);
        return res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};


export const generate2FASecret = async (req, res) => {
    const { userId } = req.body;

    try {
        let user = await global.docTrackModels.StaffAccount.findOne({ _id: userId }) ||
                     await global.docTrackModels.ManagerAccount.findOne({ _id: userId }) ||
                     await global.machineriesModels.StaffAccount.findOne({ _id: userId }) ||
                     await global.highValueCropsModels.StaffAccount.findOne({ _id: userId }) ||
                     await global.highValueCropsModels.ManagerAccount.findOne({ _id: userId });


        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        if (user.twoFASecret && user.twoFAQRCode) {
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
        let user = await global.docTrackModels.StaffAccount.findOne({ _id: userId }) ||
                     await global.docTrackModels.ManagerAccount.findOne({ _id: userId }) ||
                     await global.machineriesModels.StaffAccount.findOne({ _id: userId }) ||
                     await global.highValueCropsModels.StaffAccount.findOne({ _id: userId }) ||
                     await global.highValueCropsModels.ManagerAccount.findOne({ _id: userId });

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

        if (!isValid) {
            return res.status(400).json({ success: false, message: 'Invalid 2FA token.' });
        }

        user.is2FAEnabled = true;
        await user.save();
        
        generateTokenAndSetCookie(res, user._id);

        res.status(200).json({
            success: true,
            message: '2FA verified successfully.',
            user: {
                id: user._id,
                name: user.name,
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
        res.clearCookie('authToken');
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
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        const resetPasswordToken = crypto.randomBytes(32).toString('hex');
        const resetPasswordExpiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

        user.resetPasswordToken = resetPasswordToken;
        user.resetPasswordExpiresAt = resetPasswordExpiresAt;
        await user.save();

        await sendPasswordResetEmail(email, `${process.env.CLIENT_URL}/auth/reset-password/${resetPasswordToken}`);

        res.status(200).json({
            success: true,
            message: 'Password reset link sent to your email.'
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




