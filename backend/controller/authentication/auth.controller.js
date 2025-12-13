import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import qrcode from 'qrcode';
import { authenticator } from 'otplib';
import { encrypt, decrypt } from '../../utils/encryption.js';

import { sendWelcomeEmail, sendPasswordResetEmail, sendPasswordResetSuccessEmail } from '../../mailtrap/emails.controller.js';
import { generateTokenAndSetCookie } from '../../utils/generateTokenAndSetCookie.js'
import { generatePreTokenAndSetCookie } from '../../utils/generatePreTokenAndSetCookie.js';

const logAction = async (req, action, module, description, status) => {

  const userId =  req.decodedAuthToken ? req.decodedAuthToken.userId : 'Unknown';

  await global.globalModels.GranularLog.create({
    userId,
    action,
    module,
    description,
    status,
    ip: req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress,
    userAgent: req.headers['user-agent'],
  });
};

export const register = async (req, res) => {  //system admin level access only (ililipat in the future to a separate route for admin job controllers)
    const { first_name, last_name, middle_name, suffix, email, phone, roles, office_position } = req.body;
    try {

        const employee = await global.globalModels.EmployeeAccount.find({ $or: [{ email }, { phone }, { first_name }, { last_name }] });
        if (employee.length > 0) {
            await logAction(req, 'USER_REGISTER', 'AUTHENTICATION', `Registration attempt failed - Employee already exists: ${email}`, 'VALIDATION_FAILED');
            return res.status(400).json({ success: false, message: 'Employee already exists.' });
        }

        if (!first_name || !last_name || !email || !phone || !roles || (roles.includes('DMS') && !office_position)) {
            await logAction(req, 'USER_REGISTER', 'AUTHENTICATION', `Registration attempt failed - Missing required fields for email: ${email || 'unknown'}`, 'VALIDATION_FAILED');
            return res.status(400).json({ success: false, message: 'All fields are required.' });
        }
        const position = roles.includes('DMS') ? office_position : null;

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
            roles,
            email,
            phone,
            password: hashedPassword, //for testing purposes, should be changed to hashedPassword in the future
        });
        await newEmployee.save();
        
        await logAction(req, 'USER_REGISTER', 'SYSTEM ADMIN', `User registered: ${email}`, 'SUCCESS');

        res.status(201).json({ 
            message: 'User registered successfully', 
            success: true,
            user: {
                id: newEmployee._id,
                first_name,
                last_name,
                middle_name,
                suffix,
                roles,
                office_position
            } 
        }); 

    } catch (error) {
        if (error.code === 11000) {
            await logAction(req, 'USER_REGISTER', 'AUTHENTICATION', `Registration failed - User already exists: ${req.body.email}`, 'FAILED');
            return res.status(400).json({ success: false, message: 'User already exists.' });
        }

        await logAction(req, 'USER_REGISTER', 'AUTHENTICATION', `Registration error: ${error.message}`, 'FAILED');

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
            availableRoles: user.roles,
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
            await logAction(req, 'USER_SWITCH_ROLE', 'AUTHENTICATION', `Role switch attempt failed - Target role not provided`, 'VALIDATION_FAILED');
            return res.status(400).json({success: false, message: 'Target role is not found.'})
        };

        const user = await global.globalModels.EmployeeAccount.findById(req.decodedAuthToken.payload.userId);

        if (!user) {
            await logAction(req, 'USER_SWITCH_ROLE', 'AUTHENTICATION', `Role switch attempt failed - User not found: ${req.decodedAuthToken.payload.userId}`, 'VALIDATION_FAILED');
            return res.status(400).json({success: false, message: 'User not found.'})
        };

        const targetAccount = await global.globalModels.EmployeeAccount.findOne({ _id: user._id, email: user.email, roles: targetRole });
        if (!targetAccount) {
            await logAction(req, 'USER_SWITCH_ROLE', 'AUTHENTICATION', `Role switch attempt failed - User ${user.email} does not have access to role: ${targetRole}`, 'VALIDATION_FAILED');
            return res.status(404).json({success: false, message: 'You don\'t have access to this role or role does not exist.'})
        };

        generateTokenAndSetCookie(res, targetAccount._id, targetRole);

        await logAction(req, 'USER_SWITCH_ROLE', 'AUTHENTICATION', `User switched to role: ${targetRole}`, 'SUCCESS');

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
        await logAction(req, 'USER_SWITCH_ROLE', 'AUTHENTICATION', `Error switching roles: ${error.message}`, 'FAILED');
        return res.status(500).json({success: false, message: 'Error switching roles.'})
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            await logAction(req, 'USER_LOGIN', 'AUTHENTICATION', `Login attempt failed - Missing email or password`, 'VALIDATION_FAILED');
            return res.status(400).json({ success: false, message: 'All fields are required.'})
        }

        const user = await global.globalModels.EmployeeAccount.findOne({ email }) 
        if (!user) {
            await logAction(req, 'USER_LOGIN', 'AUTHENTICATION', `Login attempt failed - User not found: ${email}`, 'VALIDATION_FAILED');
            return res.status(404).json({ success: false, message: 'Invalid credentials.' });
        }

        if (user.isLocked) {
            await logAction(req, 'USER_LOGIN', 'AUTHENTICATION', `Login attempt failed - Account is locked: ${email}`, 'VALIDATION_FAILED');
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
                await logAction(req, 'USER_LOGIN', 'AUTHENTICATION', `Account locked due to multiple failed login attempts: ${email}`, 'VALIDATION_FAILED');
                return res.status(403).json({ success: false, message: 'Account is now locked due to multiple failed login attempts. Contact IT support to regain access.' });
            }

            const delay = Math.min(user.failedLoginAttempts.count * 1000, 10000); // up to 10s
            await new Promise(res => setTimeout(res, delay));

            await logAction(req, 'USER_LOGIN', 'AUTHENTICATION', `Login error: Invalid credentials for email: ${email}`, 'FAILED');

            return res.status(401).json({ success: false, message: 'Invalid credentials.'})
        }

        user.failedLoginAttempts = { count: 0, lastAttempt: null };
        await user.save();

        generatePreTokenAndSetCookie(res, user._id);

        await logAction(req, 'USER_LOGIN', 'AUTHENTICATION', `User login successful: ${email}`, 'SUCCESS');

        if(!user.is2FAEnabled) {
            await logAction(req, 'USER_LOGIN', 'AUTHENTICATION', `Login redirected to 2FA setup - 2FA not enabled for: ${email}`, 'VALIDATION_FAILED');
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
        await logAction(req, 'USER_LOGIN', 'AUTHENTICATION', `Login error: ${error.message}`, 'FAILED');
        console.error('Error logging in:', error);
        return res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};

export const generate2FASecret = async (req, res) => {
    const { userId } = req.body;

    try {
        const user = await global.globalModels.EmployeeAccount.findById( userId );
        if (!user) {
            await logAction(req, '2FA_SECRET_GENERATED', 'AUTHENTICATION', `2FA setup attempt failed - User not found: ${userId}`, 'VALIDATION_FAILED');
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

        await logAction(req, '2FA_SECRET_GENERATED', 'AUTHENTICATION', `2FA secret generated for user: ${user.email}`, 'SUCCESS');

        res.status(200).json({
            success: true,
            message: '2FA secret generated successfully.',
            qr,
            secret,
            userId: user._id
        });

    } catch (error) {
        await logAction(req, '2FA_SECRET_GENERATED', 'AUTHENTICATION', `Error generating 2FA secret: ${error.message}`, 'FAILED');
        console.error('Error generating 2FA secret:', error);
        return res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};

export const verify2FA = async (req, res) => {
    const { token, userId } = req.body;

    try {

        const user = await global.globalModels.EmployeeAccount.findById(userId);
        if (user.isLocked) {
            await logAction(req, '2FA_VERIFIED', 'AUTHENTICATION', `2FA verification attempt failed - Account is locked: ${userId}`, 'VALIDATION_FAILED');
            return res.status(403).json({ success: false, message: 'Account locked. Contact IT support to regain access.' });
        }

        if (!user) {
            await logAction(req, '2FA_VERIFIED', 'AUTHENTICATION', `2FA verification attempt failed - User not found: ${userId}`, 'VALIDATION_FAILED');
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        if (!user.twoFASecret) {
            await logAction(req, '2FA_VERIFIED', 'AUTHENTICATION', `2FA verification attempt failed - 2FA not enabled for user: ${userId}`, 'VALIDATION_FAILED');
            return res.status(400).json({ success: false, message: '2FA is not enabled for this user.' });
        }

        const decryptedSecret = decrypt(user.twoFASecret);

        const isValid = authenticator.verify({ 
            token,
            secret: decryptedSecret
        });

        const role = Array.isArray(user.roles) && user.roles.length > 0
                    ? String(user.roles[0])
                    : null;

        if (!isValid) {

            await user.updateOne({
                $inc: { 'failedOTPVerifications.count': 1 }, // increment failed attempts
                $set: { 'failedOTPVerifications.lastAttempt': Date.now() } // set last attempt time
            });

            if (user.failedOTPVerifications.count >= 11) {
                user.isLocked = true;
                await user.save();
                await logAction(req, '2FA_VERIFIED', 'AUTHENTICATION', `Account locked due to multiple failed 2FA attempts for user: ${user.email}`, 'VALIDATION_FAILED');
                return res.status(403).json({ success: false, message: 'Account is now locked due to multiple failed 2FA attempts. Contact IT support to regain access.' });
            }

            const delay = Math.min(user.failedOTPVerifications.count * 1000, 10000); // up to 10s
            await new Promise(res => setTimeout(res, delay));

            await logAction(req, '2FA_VERIFIED', 'AUTHENTICATION', `Error verifying 2FA: Invalid token for user: ${user.email}`, 'FAILED');
            
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
        generateTokenAndSetCookie(res, user._id, role);

        await logAction(req, '2FA_VERIFIED', 'AUTHENTICATION', `2FA verified successfully for user: ${user.email}`, 'SUCCESS');

        res.status(200).json({
            success: true,
            message: '2FA verified successfully.', 
            user: {
                id: user._id,
                first_name: user.first_name,
                last_name: user.last_name,
                middle_name: user.middle_name,
                suffix: user.suffix,
                role: role,
                office_position: user.office_position
            }
        });

    } catch (error) {
        await logAction(req, '2FA_VERIFIED', 'AUTHENTICATION', `Error verifying 2FA: ${error.message}`, 'FAILED');
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

        await logAction(req, 'USER_LOGOUT', 'AUTHENTICATION', 'User logged out successfully', 'SUCCESS');

        res.status(200).json({ success: true, message: 'Logout successful.' });
    } catch (error) {
        await logAction(req, 'USER_LOGOUT', 'AUTHENTICATION', `Error logging out: ${error.message}`, 'FAILED');
        console.error('Error logging out:', error);
        return res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};

export const forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {   
        if (!email) {
            await logAction(req, 'PASSWORD_RESET_REQUESTED', 'AUTHENTICATION', `Password reset attempt failed - Email not provided`, 'VALIDATION_FAILED');
            return res.status(400).json({ success: false, message: 'Email is required.'})
        }

        let user = await global.globalModels.EmployeeAccount.findOne({ email });
        if (!user) {
            await logAction(req, 'PASSWORD_RESET_REQUESTED', 'AUTHENTICATION', `Password reset attempt failed - Email not found: ${email}`, 'VALIDATION_FAILED');
            return res.status(404).json({ success: false, message: 'We cannot find your email.' });
        }

        const resetPasswordToken = crypto.randomBytes(32).toString('hex');
        const resetPasswordExpiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

        await sendPasswordResetEmail(email, `${process.env.CLIENT_URL}/auth/reset-password/${resetPasswordToken}`); 

        user.resetPasswordToken = resetPasswordToken;
        user.resetPasswordExpiresAt = resetPasswordExpiresAt;
        await user.save();

        await logAction(req, 'PASSWORD_RESET_REQUESTED', 'AUTHENTICATION', `Password reset requested for: ${email}`, 'SUCCESS');

        res.status(200).json({
            success: true,
            message: 'Reset email sent. If not received immediately, check spam or wait a few minutes before requesting again.'
        });

    } catch (error) {
        await logAction(req, 'PASSWORD_RESET_REQUESTED', 'AUTHENTICATION', `Error requesting password reset: ${error.message}`, 'FAILED');
        console.error('Error resetting password:', error);
        return res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};

export const resetPassword = async (req, res) => {
    const { token } = req.params;
    const { newPassword } = req.body;

    try {
        let user = await global.globalModels.EmployeeAccount.findOne({ resetPasswordToken: token, resetPasswordExpiresAt: { $gt: Date.now() } });
        if (!user) {
            await logAction(req, 'PASSWORD_RESET', 'AUTHENTICATION', `Password reset attempt failed - Invalid or expired token`, 'VALIDATION_FAILED');
            return res.status(404).json({ success: false, message: 'Invalid or expired reset token.' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 12);

        user.password = hashedPassword;
        user.resetPasswordToken = undefined;  
        user.resetPasswordExpiresAt = undefined; 
        await user.save();

        await sendPasswordResetSuccessEmail(user.email);
        
        await logAction(req, 'PASSWORD_RESET', 'AUTHENTICATION', `Password reset completed for user: ${user.email}`, 'SUCCESS');

        res.status(200).json({
            success: true,
            message: 'Password reset successful.'
        });

    } catch (error) {
        await logAction(req, 'PASSWORD_RESET', 'AUTHENTICATION', `Error completing password reset: ${error.message}`, 'FAILED');
        console.error('Error resetting password:', error);
        return res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};




