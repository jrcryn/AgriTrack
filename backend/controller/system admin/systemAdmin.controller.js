import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { sendWelcomeEmail } from '../../mailtrap/emails.controller.js';
import { logAction } from '../../utils/logAction.js';

// Register new employee account
export const register = async (req, res) => {
    const { first_name, last_name, middle_name, suffix, email, phone, roles, office_position } = req.body;
    
    const userId = req.decodedAuthToken.payload.userId;
    
    try {
        const employee = await global.globalModels.EmployeeAccount.find({ $or: [{ email }, { phone }, { first_name }, { last_name }] });
        if (employee.length > 0) {
            await logAction(req, userId, 'USER_REGISTER', 'SYSTEM ADMIN', `Registration attempt failed - Employee already exists: ${email}`, 'VALIDATION_FAILED');
            return res.status(400).json({ success: false, message: 'Employee already exists.' });
        }

        if (!first_name || !last_name || !email || !phone || !roles || (roles.includes('DMS') && !office_position)) {
            await logAction(req, userId, 'USER_REGISTER', 'SYSTEM ADMIN', `Registration attempt failed - Missing required fields for email: ${email || 'unknown'}`, 'VALIDATION_FAILED');
            return res.status(400).json({ success: false, message: 'All fields are required.' });
        }
        const position = roles.includes('DMS') ? office_position : null;

        const defaultPassword = crypto.randomBytes(8).toString('hex'); 
        const hashedPassword = await bcrypt.hash(defaultPassword, 12);

        await sendWelcomeEmail(email, defaultPassword);
        const newEmployee = await global.globalModels.EmployeeAccount.create({
            first_name,
            last_name,
            middle_name,
            suffix,
            office_position: position,
            roles,
            email,
            phone,
            password: hashedPassword,
        });
        await newEmployee.save();
        
        await logAction(req, userId, 'USER_REGISTER', 'SYSTEM ADMIN', `User registered: ${email}`, 'SUCCESS');

        res.status(201).json({ 
            message: 'User registered successfully', 
            success: true,
            temporaryPassword: defaultPassword,
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
            await logAction(req, userId, 'USER_REGISTER', 'SYSTEM ADMIN', `Registration failed - User already exists: ${req.body.email}`, 'FAILED');
            return res.status(400).json({ success: false, message: 'User already exists.' });
        }

        await logAction(req, userId, 'USER_REGISTER', 'SYSTEM ADMIN', `Registration error: ${error.message}`, 'FAILED');

        console.error('Error signing up:', error);
        return res.status(500).json({ success: false ,message: 'Internal server error.' });
    }
};

// Register new system admin account
export const registerSystemAdmin = async (req, res) => {
    const { first_name, last_name, middle_name, suffix, email, phone } = req.body;
    
    const userId = req.decodedAuthToken.payload.userId;
    
    try {
        const existingAdmin = await global.systemAdminModels.SystemAdminAccount.findOne({ $or: [{ email }, { phone }] });
        if (existingAdmin) {
            //await logAction(req, userId, 'SYSTEM_ADMIN_REGISTER', 'SYSTEM ADMIN', `Registration attempt failed - System admin already exists: ${email}`, 'VALIDATION_FAILED');
            return res.status(400).json({ success: false, message: 'System admin already exists.' });
        }

        if (!first_name || !last_name || !email || !phone) {
            await logAction(req, userId, 'SYSTEM_ADMIN_REGISTER', 'SYSTEM ADMIN', `Registration attempt failed - Missing required fields for email: ${email || 'unknown'}`, 'VALIDATION_FAILED');
            return res.status(400).json({ success: false, message: 'All fields are required.' });
        }

        const defaultPassword = crypto.randomBytes(8).toString('hex'); 
        const hashedPassword = await bcrypt.hash(defaultPassword, 12);

        await sendWelcomeEmail(email, defaultPassword);
        const newSystemAdmin = await global.systemAdminModels.SystemAdminAccount.create({
            first_name,
            last_name,
            middle_name,
            suffix,
            email,
            phone,
            password: hashedPassword,
        });
        await newSystemAdmin.save();
        
        await logAction(req, userId, 'SYSTEM_ADMIN_REGISTER', 'SYSTEM ADMIN', `System admin registered: ${email}`, 'SUCCESS');

        res.status(201).json({ 
            message: 'System admin registered successfully', 
            success: true,
            temporaryPassword: defaultPassword,
            admin: {
                id: newSystemAdmin._id,
                first_name,
                last_name,
                middle_name,
                suffix,
                email,
                phone
            } 
        }); 

    } catch (error) {
        if (error.code === 11000) {
            await logAction(req, userId, 'SYSTEM_ADMIN_REGISTER', 'SYSTEM ADMIN', `Registration failed - System admin already exists: ${req.body.email}`, 'FAILED');
            return res.status(400).json({ success: false, message: 'System admin already exists.' });
        }

        await logAction(req, userId, 'SYSTEM_ADMIN_REGISTER', 'SYSTEM ADMIN', `Registration error: ${error.message}`, 'FAILED');

        console.error('Error signing up system admin:', error);
        return res.status(500).json({ success: false ,message: 'Internal server error.' });
    }
};

// Change user email
export const changeUserEmail = async (req, res) => {
    const { targetUserId, newEmail, accountType } = req.body;
    const userId = req.decodedAuthToken.payload.userId;

    try {
        if (!targetUserId || !newEmail || !accountType) {
            await logAction(req, userId, 'USER_EMAIL_UPDATED', 'SYSTEM ADMIN', `Email update failed - Missing required fields`, 'VALIDATION_FAILED');
            return res.status(400).json({ success: false, message: 'Target user ID, new email, and account type are required.' });
        }

        const Model = accountType === 'SYSTEM_ADMIN' 
            ? global.systemAdminModels.SystemAdminAccount 
            : global.globalModels.EmployeeAccount;

        // Check if new email already exists
        const existingUser = await Model.findOne({ email: newEmail });
        if (existingUser) {
            await logAction(req, userId, 'USER_EMAIL_UPDATED', 'SYSTEM ADMIN', `Email update failed - Email already in use: ${newEmail}`, 'VALIDATION_FAILED');
            return res.status(400).json({ success: false, message: 'Email already in use.' });
        }

        const user = await Model.findById(targetUserId);
        if (!user) {
            await logAction(req, userId, 'USER_EMAIL_UPDATED', 'SYSTEM ADMIN', `Email update failed - User not found: ${targetUserId}`, 'VALIDATION_FAILED');
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        const oldEmail = user.email;
        user.email = newEmail;
        await user.save();

        await logAction(req, userId, 'USER_EMAIL_UPDATED', 'SYSTEM ADMIN', `Email updated for user ${targetUserId}: ${oldEmail} -> ${newEmail}`, 'SUCCESS');

        res.status(200).json({ 
            success: true, 
            message: 'Email updated successfully.',
            user: {
                id: user._id,
                email: user.email
            }
        });

    } catch (error) {
        await logAction(req, userId, 'USER_EMAIL_UPDATED', 'SYSTEM ADMIN', `Email update error: ${error.message}`, 'FAILED');
        console.error('Error updating email:', error);
        return res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};

// Change user name
export const changeUserName = async (req, res) => {
    const { targetUserId, first_name, last_name, middle_name, suffix, accountType } = req.body;
    const userId = req.decodedAuthToken.payload.userId;

    try {
        if (!targetUserId || !first_name || !last_name || !accountType) {
            await logAction(req, userId, 'USER_NAME_UPDATED', 'SYSTEM ADMIN', `Name update failed - Missing required fields`, 'VALIDATION_FAILED');
            return res.status(400).json({ success: false, message: 'Target user ID, first name, last name, and account type are required.' });
        }

        const Model = accountType === 'SYSTEM_ADMIN' 
            ? global.systemAdminModels.SystemAdminAccount 
            : global.globalModels.EmployeeAccount;

        const user = await Model.findById(targetUserId);
        if (!user) {
            await logAction(req, userId, 'USER_NAME_UPDATED', 'SYSTEM ADMIN', `Name update failed - User not found: ${targetUserId}`, 'VALIDATION_FAILED');
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        const oldName = `${user.first_name} ${user.middle_name || ''} ${user.last_name} ${user.suffix || ''}`.trim();
        user.first_name = first_name;
        user.last_name = last_name;
        user.middle_name = middle_name || user.middle_name;
        user.suffix = suffix || user.suffix;
        await user.save();

        const newName = `${user.first_name} ${user.middle_name || ''} ${user.last_name} ${user.suffix || ''}`.trim();
        await logAction(req, userId, 'USER_NAME_UPDATED', 'SYSTEM ADMIN', `Name updated for user ${targetUserId}: ${oldName} -> ${newName}`, 'SUCCESS');

        res.status(200).json({ 
            success: true, 
            message: 'Name updated successfully.',
            user: {
                id: user._id,
                first_name: user.first_name,
                last_name: user.last_name,
                middle_name: user.middle_name,
                suffix: user.suffix
            }
        });

    } catch (error) {
        await logAction(req, userId, 'USER_NAME_UPDATED', 'SYSTEM ADMIN', `Name update error: ${error.message}`, 'FAILED');
        console.error('Error updating name:', error);
        return res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};

// Change user phone
export const changeUserPhone = async (req, res) => {
    const { targetUserId, newPhone, accountType } = req.body;
    const userId = req.decodedAuthToken.payload.userId;

    try {
        if (!targetUserId || !newPhone || !accountType) {
            await logAction(req, userId, 'USER_PHONE_UPDATED', 'SYSTEM ADMIN', `Phone update failed - Missing required fields`, 'VALIDATION_FAILED');
            return res.status(400).json({ success: false, message: 'Target user ID, new phone, and account type are required.' });
        }

        const Model = accountType === 'SYSTEM_ADMIN' 
            ? global.systemAdminModels.SystemAdminAccount 
            : global.globalModels.EmployeeAccount;

        // Check if new phone already exists
        const existingUser = await Model.findOne({ phone: newPhone });
        if (existingUser) {
            await logAction(req, userId, 'USER_PHONE_UPDATED', 'SYSTEM ADMIN', `Phone update failed - Phone already in use: ${newPhone}`, 'VALIDATION_FAILED');
            return res.status(400).json({ success: false, message: 'Phone number already in use.' });
        }

        const user = await Model.findById(targetUserId);
        if (!user) {
            await logAction(req, userId, 'USER_PHONE_UPDATED', 'SYSTEM ADMIN', `Phone update failed - User not found: ${targetUserId}`, 'VALIDATION_FAILED');
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        const oldPhone = user.phone;
        user.phone = newPhone;
        await user.save();

        await logAction(req, userId, 'USER_PHONE_UPDATED', 'SYSTEM ADMIN', `Phone updated for user ${targetUserId}: ${oldPhone} -> ${newPhone}`, 'SUCCESS');

        res.status(200).json({ 
            success: true, 
            message: 'Phone number updated successfully.',
            user: {
                id: user._id,
                phone: user.phone
            }
        });

    } catch (error) {
        await logAction(req, userId, 'USER_PHONE_UPDATED', 'SYSTEM ADMIN', `Phone update error: ${error.message}`, 'FAILED');
        console.error('Error updating phone:', error);
        return res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};

// Change user roles (Employee accounts only)
export const changeUserRoles = async (req, res) => {
    const { targetUserId, roles } = req.body;
    const userId = req.decodedAuthToken.payload.userId;

    try {
        if (!targetUserId || !roles || !Array.isArray(roles)) {
            await logAction(req, userId, 'USER_ROLES_UPDATED', 'SYSTEM ADMIN', `Roles update failed - Missing or invalid roles`, 'VALIDATION_FAILED');
            return res.status(400).json({ success: false, message: 'Target user ID and roles array are required.' });
        }

        const user = await global.globalModels.EmployeeAccount.findById(targetUserId);
        if (!user) {
            await logAction(req, userId, 'USER_ROLES_UPDATED', 'SYSTEM ADMIN', `Roles update failed - User not found: ${targetUserId}`, 'VALIDATION_FAILED');
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        const oldRoles = user.roles;
        user.roles = roles;
        await user.save();

        await logAction(req, userId, 'USER_ROLES_UPDATED', 'SYSTEM ADMIN', `Roles updated for user ${targetUserId}: ${oldRoles.join(', ')} -> ${roles.join(', ')}`, 'SUCCESS');

        res.status(200).json({ 
            success: true, 
            message: 'Roles updated successfully.',
            user: {
                id: user._id,
                roles: user.roles
            }
        });

    } catch (error) {
        await logAction(req, userId, 'USER_ROLES_UPDATED', 'SYSTEM ADMIN', `Roles update error: ${error.message}`, 'FAILED');
        console.error('Error updating roles:', error);
        return res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};

// Change user office position (Employee accounts only)
export const changeUserOfficePosition = async (req, res) => {
    const { targetUserId, office_position } = req.body;
    const userId = req.decodedAuthToken.payload.userId;

    try {
        if (!targetUserId || !office_position) {
            await logAction(req, userId, 'USER_OFFICE_POSITION_UPDATED', 'SYSTEM ADMIN', `Office position update failed - Missing required fields`, 'VALIDATION_FAILED');
            return res.status(400).json({ success: false, message: 'Target user ID and office position are required.' });
        }

        const validPositions = ['CFS', 'LPMS', 'ANMS', 'RTSS'];
        if (!validPositions.includes(office_position)) {
            await logAction(req, userId, 'USER_OFFICE_POSITION_UPDATED', 'SYSTEM ADMIN', `Office position update failed - Invalid position: ${office_position}`, 'VALIDATION_FAILED');
            return res.status(400).json({ success: false, message: 'Invalid office position.' });
        }

        const user = await global.globalModels.EmployeeAccount.findById(targetUserId);
        if (!user) {
            await logAction(req, userId, 'USER_OFFICE_POSITION_UPDATED', 'SYSTEM ADMIN', `Office position update failed - User not found: ${targetUserId}`, 'VALIDATION_FAILED');
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        const oldPosition = user.office_position;
        user.office_position = office_position;
        await user.save();

        await logAction(req, userId, 'USER_OFFICE_POSITION_UPDATED', 'SYSTEM ADMIN', `Office position updated for user ${targetUserId}: ${oldPosition || 'none'} -> ${office_position}`, 'SUCCESS');

        res.status(200).json({ 
            success: true, 
            message: 'Office position updated successfully.',
            user: {
                id: user._id,
                office_position: user.office_position
            }
        });

    } catch (error) {
        await logAction(req, userId, 'USER_OFFICE_POSITION_UPDATED', 'SYSTEM ADMIN', `Office position update error: ${error.message}`, 'FAILED');
        console.error('Error updating office position:', error);
        return res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};

// Change user password
export const changeUserPassword = async (req, res) => {
    const { targetUserId, newPassword, accountType } = req.body;
    const userId = req.decodedAuthToken.payload.userId;

    try {
        if (!targetUserId || !newPassword || !accountType) {
            await logAction(req, userId, 'USER_PASSWORD_CHANGED', 'SYSTEM ADMIN', `Password change failed - Missing required fields`, 'VALIDATION_FAILED');
            return res.status(400).json({ success: false, message: 'Target user ID, new password, and account type are required.' });
        }

        if (newPassword.length < 8) {
            await logAction(req, userId, 'USER_PASSWORD_CHANGED', 'SYSTEM ADMIN', `Password change failed - Password too short`, 'VALIDATION_FAILED');
            return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long.' });
        }

        const Model = accountType === 'SYSTEM_ADMIN' 
            ? global.systemAdminModels.SystemAdminAccount 
            : global.globalModels.EmployeeAccount;

        const user = await Model.findById(targetUserId);
        if (!user) {
            await logAction(req, userId, 'USER_PASSWORD_CHANGED', 'SYSTEM ADMIN', `Password change failed - User not found: ${targetUserId}`, 'VALIDATION_FAILED');
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 12);
        user.password = hashedPassword;
        await user.save();

        await logAction(req, userId, 'USER_PASSWORD_CHANGED', 'SYSTEM ADMIN', `Password changed for user ${targetUserId}`, 'SUCCESS');

        res.status(200).json({ 
            success: true, 
            message: 'Password updated successfully.'
        });

    } catch (error) {
        await logAction(req, userId, 'USER_PASSWORD_CHANGED', 'SYSTEM ADMIN', `Password change error: ${error.message}`, 'FAILED');
        console.error('Error changing password:', error);
        return res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};

// Reset user 2FA secret
export const resetUser2FA = async (req, res) => {
    const { targetUserId, accountType } = req.body;
    const userId = req.decodedAuthToken.payload.userId;

    try {
        if (!targetUserId || !accountType) {
            await logAction(req, userId, 'USER_2FA_RESET', 'SYSTEM ADMIN', `2FA reset failed - Missing required fields`, 'VALIDATION_FAILED');
            return res.status(400).json({ success: false, message: 'Target user ID and account type are required.' });
        }

        const Model = accountType === 'SYSTEM_ADMIN' 
            ? global.systemAdminModels.SystemAdminAccount 
            : global.globalModels.EmployeeAccount;

        const user = await Model.findById(targetUserId);
        if (!user) {
            await logAction(req, userId, 'USER_2FA_RESET', 'SYSTEM ADMIN', `2FA reset failed - User not found: ${targetUserId}`, 'VALIDATION_FAILED');
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        user.twoFASecret = undefined;
        user.twoFAQRCode = undefined;
        user.is2FAEnabled = false;
        await user.save();

        await logAction(req, userId, 'USER_2FA_RESET', 'SYSTEM ADMIN', `2FA reset for user ${targetUserId}`, 'SUCCESS');

        res.status(200).json({ 
            success: true, 
            message: '2FA reset successfully.'
        });

    } catch (error) {
        await logAction(req, userId, 'USER_2FA_RESET', 'SYSTEM ADMIN', `2FA reset error: ${error.message}`, 'FAILED');
        console.error('Error resetting 2FA:', error);
        return res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};

// Archive user account
export const archiveUserAccount = async (req, res) => {
    const { targetUserId, accountType } = req.body;
    const userId = req.decodedAuthToken.payload.userId;

    try {
        if (!targetUserId || !accountType) {
            await logAction(req, userId, 'USER_ARCHIVED', 'SYSTEM ADMIN', `Archive failed - Missing required fields`, 'VALIDATION_FAILED');
            return res.status(400).json({ success: false, message: 'Target user ID and account type are required.' });
        }

        const Model = accountType === 'SYSTEM_ADMIN' 
            ? global.systemAdminModels.SystemAdminAccount 
            : global.globalModels.EmployeeAccount;

        const user = await Model.findById(targetUserId);
        if (!user) {
            await logAction(req, userId, 'USER_ARCHIVED', 'SYSTEM ADMIN', `Archive failed - User not found: ${targetUserId}`, 'VALIDATION_FAILED');
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        if (user.isArchived) {
            await logAction(req, userId, 'USER_ARCHIVED', 'SYSTEM ADMIN', `Archive failed - User already archived: ${targetUserId}`, 'VALIDATION_FAILED');
            return res.status(400).json({ success: false, message: 'User is already archived.' });
        }

        user.isArchived = true;
        user.archivedAt = new Date();
        user.archivedBy = userId;
        await user.save();

        await logAction(req, userId, 'USER_ARCHIVED', 'SYSTEM ADMIN', `User archived: ${targetUserId}`, 'SUCCESS');

        res.status(200).json({ 
            success: true, 
            message: 'User archived successfully.'
        });

    } catch (error) {
        await logAction(req, userId, 'USER_ARCHIVED', 'SYSTEM ADMIN', `Archive error: ${error.message}`, 'FAILED');
        console.error('Error archiving user:', error);
        return res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};

// Unarchive user account
export const unarchiveUserAccount = async (req, res) => {
    const { targetUserId, accountType } = req.body;
    const userId = req.decodedAuthToken.payload.userId;

    try {
        if (!targetUserId || !accountType) {
            await logAction(req, userId, 'USER_UNARCHIVED', 'SYSTEM ADMIN', `Unarchive failed - Missing required fields`, 'VALIDATION_FAILED');
            return res.status(400).json({ success: false, message: 'Target user ID and account type are required.' });
        }

        const Model = accountType === 'SYSTEM_ADMIN' 
            ? global.systemAdminModels.SystemAdminAccount 
            : global.globalModels.EmployeeAccount;

        const user = await Model.findById(targetUserId);
        if (!user) {
            await logAction(req, userId, 'USER_UNARCHIVED', 'SYSTEM ADMIN', `Unarchive failed - User not found: ${targetUserId}`, 'VALIDATION_FAILED');
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        if (!user.isArchived) {
            await logAction(req, userId, 'USER_UNARCHIVED', 'SYSTEM ADMIN', `Unarchive failed - User is not archived: ${targetUserId}`, 'VALIDATION_FAILED');
            return res.status(400).json({ success: false, message: 'User is not archived.' });
        }

        user.isArchived = false;
        user.archivedAt = undefined;
        user.archivedBy = undefined;
        await user.save();

        await logAction(req, userId, 'USER_UNARCHIVED', 'SYSTEM ADMIN', `User unarchived: ${targetUserId}`, 'SUCCESS');

        res.status(200).json({ 
            success: true, 
            message: 'User unarchived successfully.'
        });

    } catch (error) {
        await logAction(req, userId, 'USER_UNARCHIVED', 'SYSTEM ADMIN', `Unarchive error: ${error.message}`, 'FAILED');
        console.error('Error unarchiving user:', error);
        return res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};

// Lock user account
export const lockUserAccount = async (req, res) => {
    const { targetUserId, accountType } = req.body;
    const userId = req.decodedAuthToken.payload.userId;

    try {
        if (!targetUserId || !accountType) {
            await logAction(req, userId, 'USER_LOCKED', 'SYSTEM ADMIN', `Lock failed - Missing required fields`, 'VALIDATION_FAILED');
            return res.status(400).json({ success: false, message: 'Target user ID and account type are required.' });
        }

        const Model = accountType === 'SYSTEM_ADMIN' 
            ? global.systemAdminModels.SystemAdminAccount 
            : global.globalModels.EmployeeAccount;

        const user = await Model.findById(targetUserId);
        if (!user) {
            await logAction(req, userId, 'USER_LOCKED', 'SYSTEM ADMIN', `Lock failed - User not found: ${targetUserId}`, 'VALIDATION_FAILED');
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        if (user.isLocked) {
            await logAction(req, userId, 'USER_LOCKED', 'SYSTEM ADMIN', `Lock failed - User already locked: ${targetUserId}`, 'VALIDATION_FAILED');
            return res.status(400).json({ success: false, message: 'User is already locked.' });
        }

        user.isLocked = true;
        await user.save();

        await logAction(req, userId, 'USER_LOCKED', 'SYSTEM ADMIN', `User locked: ${targetUserId}`, 'SUCCESS');

        res.status(200).json({ 
            success: true, 
            message: 'User locked successfully.'
        });

    } catch (error) {
        await logAction(req, userId, 'USER_LOCKED', 'SYSTEM ADMIN', `Lock error: ${error.message}`, 'FAILED');
        console.error('Error locking user:', error);
        return res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};

// Unlock user account
export const unlockUserAccount = async (req, res) => {
    const { targetUserId, accountType } = req.body;
    const userId = req.decodedAuthToken.payload.userId;

    try {
        if (!targetUserId || !accountType) {
            await logAction(req, userId, 'USER_UNLOCKED', 'SYSTEM ADMIN', `Unlock failed - Missing required fields`, 'VALIDATION_FAILED');
            return res.status(400).json({ success: false, message: 'Target user ID and account type are required.' });
        }

        const Model = accountType === 'SYSTEM_ADMIN' 
            ? global.systemAdminModels.SystemAdminAccount 
            : global.globalModels.EmployeeAccount;

        const user = await Model.findById(targetUserId);
        if (!user) {
            await logAction(req, userId, 'USER_UNLOCKED', 'SYSTEM ADMIN', `Unlock failed - User not found: ${targetUserId}`, 'VALIDATION_FAILED');
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        if (!user.isLocked) {
            await logAction(req, userId, 'USER_UNLOCKED', 'SYSTEM ADMIN', `Unlock failed - User is not locked: ${targetUserId}`, 'VALIDATION_FAILED');
            return res.status(400).json({ success: false, message: 'User is not locked.' });
        }

        user.isLocked = false;
        // Reset failed login attempts when unlocking
        user.failedLoginAttempts = { count: 0, lastAttempt: null };
        user.failedOTPVerifications = { count: 0, lastAttempt: null };
        await user.save();

        await logAction(req, userId, 'USER_UNLOCKED', 'SYSTEM ADMIN', `User unlocked: ${targetUserId}`, 'SUCCESS');

        res.status(200).json({ 
            success: true, 
            message: 'User unlocked successfully.'
        });

    } catch (error) {
        await logAction(req, userId, 'USER_UNLOCKED', 'SYSTEM ADMIN', `Unlock error: ${error.message}`, 'FAILED');
        console.error('Error unlocking user:', error);
        return res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};

// Update user account (name, phone, email, roles, office_position)
export const updateUserAccount = async (req, res) => {
    const { 
        targetUserId, 
        accountType,
        first_name,
        last_name,
        middle_name,
        suffix,
        email,
        phone,
        roles,
        office_position
    } = req.body;
    const userId = req.decodedAuthToken.payload.userId;

    try {
        if (!targetUserId || !accountType) {
            await logAction(req, userId, 'USER_UPDATED', 'SYSTEM ADMIN', `Update failed - Missing required fields`, 'FAILED');
            return res.status(400).json({ success: false, message: 'Target user ID and account type are required.' });
        }

        const Model = accountType === 'SYSTEM_ADMIN' 
            ? global.systemAdminModels.SystemAdminAccount 
            : global.globalModels.EmployeeAccount;

        const user = await Model.findById(targetUserId);
        if (!user) {
            await logAction(req, userId, 'USER_UPDATED', 'SYSTEM ADMIN', `Update failed - User not found: ${targetUserId}`, 'FAILED');
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        const changes = [];
        const oldValues = {};

        // Update name fields
        if (first_name !== undefined) {
            oldValues.first_name = user.first_name;
            user.first_name = first_name;
            changes.push(`first_name: ${oldValues.first_name} -> ${first_name}`);
        }
        if (last_name !== undefined) {
            oldValues.last_name = user.last_name;
            user.last_name = last_name;
            changes.push(`last_name: ${oldValues.last_name} -> ${last_name}`);
        }
        if (middle_name !== undefined) {
            oldValues.middle_name = user.middle_name;
            user.middle_name = middle_name;
            changes.push(`middle_name: ${oldValues.middle_name || 'none'} -> ${middle_name || 'none'}`);
        }
        if (suffix !== undefined) {
            oldValues.suffix = user.suffix;
            user.suffix = suffix;
            changes.push(`suffix: ${oldValues.suffix || 'none'} -> ${suffix || 'none'}`);
        }

        // Update email
        if (email !== undefined && email !== user.email) {
            // Check if new email already exists
            const existingUser = await Model.findOne({ email, _id: { $ne: targetUserId } });
            if (existingUser) {
                await logAction(req, userId, 'USER_UPDATED', 'SYSTEM ADMIN', `Update failed - Email already in use: ${email}`, 'FAILED');
                return res.status(400).json({ success: false, message: 'Email already in use.' });
            }
            oldValues.email = user.email;
            user.email = email;
            changes.push(`email: ${oldValues.email} -> ${email}`);
        }

        // Update phone
        if (phone !== undefined && phone !== user.phone) {
            // Check if new phone already exists
            const existingUser = await Model.findOne({ phone, _id: { $ne: targetUserId } });
            if (existingUser) {
                await logAction(req, userId, 'USER_UPDATED', 'SYSTEM ADMIN', `Update failed - Phone already in use: ${phone}`, 'FAILED');
                return res.status(400).json({ success: false, message: 'Phone number already in use.' });
            }
            oldValues.phone = user.phone;
            user.phone = phone;
            changes.push(`phone: ${oldValues.phone} -> ${phone}`);
        }

        // Update roles (only for employee accounts)
        if (roles !== undefined && accountType !== 'SYSTEM_ADMIN') {
            if (!Array.isArray(roles) && !roles.includes('DMS' || "DMM" || "MIS" || "MIM" || "HVCS" || "HVCM" )) {
                await logAction(req, userId, 'USER_UPDATED', 'SYSTEM ADMIN', `Update failed - Roles must be an array`, 'FAILED');
                return res.status(400).json({ success: false, message: 'Roles must be an array.' });
            }
            oldValues.roles = user.roles;
            user.roles = roles;
            changes.push(`roles: ${oldValues.roles.join(', ') || 'none'} -> ${roles.join(', ') || 'none'}`);
        }

        // Update office position (only for employee accounts with DMS role)
        if (office_position !== undefined && accountType !== 'SYSTEM_ADMIN') {
            if (office_position && !['CFS', 'LPMS', 'ANMS', 'RTSS'].includes(office_position)) {
                await logAction(req, userId, 'USER_UPDATED', 'SYSTEM ADMIN', `Update failed - Invalid office position: ${office_position}`, 'FAILED');
                return res.status(400).json({ success: false, message: 'Invalid office position.' });
            }
            oldValues.office_position = user.office_position;
            user.office_position = office_position || null;
            changes.push(`office_position: ${oldValues.office_position || 'none'} -> ${office_position || 'none'}`);
        }

        if (changes.length === 0) {
            await logAction(req, userId, 'USER_UPDATED', 'SYSTEM ADMIN', `Update failed - No changes provided`, 'FAILED');
            return res.status(400).json({ success: false, message: 'No changes provided.' });
        }

        await user.save();

        await logAction(req, userId, 'USER_UPDATED', 'SYSTEM ADMIN', `User updated: ${targetUserId} - ${changes.join('; ')}`, 'SUCCESS');

        res.status(200).json({ 
            success: true, 
            message: 'User updated successfully.',
            user: {
                id: user._id,
                first_name: user.first_name,
                last_name: user.last_name,
                middle_name: user.middle_name,
                suffix: user.suffix,
                email: user.email,
                phone: user.phone,
                roles: accountType !== 'SYSTEM_ADMIN' ? user.roles : undefined,
                office_position: accountType !== 'SYSTEM_ADMIN' ? user.office_position : undefined
            }
        });

    } catch (error) {
        await logAction(req, userId, 'USER_UPDATED', 'SYSTEM ADMIN', `Update error: ${error.message}`, 'FAILED');
        console.error('Error updating user:', error);
        return res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};

// Fetch action logs with pagination and search
export const getActionLogs = async (req, res) => {
    const { search = '', action = '', module = '', status = '', userId = '' } = req.query;

    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        // Build search query
        const query = {};
        
        if (search) {
            query.$or = [
                { description: { $regex: search, $options: 'i' } },
                { ip: { $regex: search, $options: 'i' } },
                { userAgent: { $regex: search, $options: 'i' } }
            ];
        }

        if (action) {
            query.action = action;
        }

        if (module) {
            query.module = module;
        }

        if (status) {
            query.status = status;
        }

        if (userId) {
            query.userId = userId;
        }

        const totalLogs = await global.globalModels.GranularLog.countDocuments(query);
        const logs = await global.globalModels.GranularLog.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        // Manually populate userId field (can be EmployeeAccount or SystemAdminAccount)
        // Collect all unique user IDs
        const userIds = [...new Set(logs.map(log => log.userId).filter(Boolean))];
        
        // Batch fetch from both collections
        const [employees, admins] = await Promise.all([
            global.globalModels.EmployeeAccount.find({ _id: { $in: userIds } })
                .select('first_name last_name middle_name suffix email')
                .lean(),
            global.systemAdminModels.SystemAdminAccount.find({ _id: { $in: userIds } })
                .select('first_name last_name middle_name suffix email')
                .lean()
        ]);

        // Create a map for quick lookup
        const userMap = new Map();
        [...employees, ...admins].forEach(user => {
            userMap.set(user._id.toString(), user);
        });

        // Populate logs with user data
        const populatedLogs = logs.map(log => {
            if (!log.userId) {
                return { ...log, userId: null };
            }

            const user = userMap.get(log.userId.toString());
            return {
                ...log,
                userId: user || { _id: log.userId, first_name: 'Unknown', last_name: 'User' }
            };
        });


        res.status(200).json({
            success: true,
            logs: populatedLogs,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalLogs / limit),
                totalLogs,
                limit: limit
            }
        });

    } catch (error) {
        console.error('Error fetching logs:', error);
        return res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};

export const getEmployeeAccounts = async (req, res) => {
    const { search = '', role = '', status = '' } = req.query;

    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;

        // Build search query
        const query = {};
        
        if (search) {
            query.$or = [
                { first_name: { $regex: search, $options: 'i' } },
                { last_name: { $regex: search, $options: 'i' } },
                { middle_name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } }
            ];
        }

        if (role && role !== 'all') {
            query.roles = role;
        }

        // Status filtering
        // By default, exclude archived accounts unless explicitly requested
        if (status) {
            if (status === 'active') {
                query.isLocked = false;
                query.isArchived = false;
            } else if (status === 'locked') {
                query.isLocked = true;
                query.isArchived = false; // Don't show archived when filtering locked
            } else if (status === 'archived') {
                query.isArchived = true;
            }
        } else {
            // Default: exclude archived accounts
            query.isArchived = false;
        }

        const totalEmployees = await global.globalModels.EmployeeAccount.countDocuments(query);
        const employees = await global.globalModels.EmployeeAccount.find(query)
            .select('-password -twoFASecret -twoFAQRCode')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();


        res.status(200).json({
            success: true,
            employees,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalEmployees / limit),
                totalEmployees,
                limit: limit
            }
        });

    } catch (error) {
        console.error('Error fetching employee accounts:', error);
        return res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};

// Get system admin accounts
export const getSystemAdminAccounts = async (req, res) => {
    const { search = '', status = '' } = req.query;

    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;

        // Build search query
        const query = {};
        
        if (search) {
            query.$or = [
                { first_name: { $regex: search, $options: 'i' } },
                { last_name: { $regex: search, $options: 'i' } },
                { middle_name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } }
            ];
        }

        // Status filtering
        // By default, exclude archived accounts unless explicitly requested
        if (status) {
            if (status === 'active') {
                query.isLocked = false;
                query.isArchived = false;
            } else if (status === 'locked') {
                query.isLocked = true;
                query.isArchived = false; // Don't show archived when filtering locked
            } else if (status === 'archived') {
                query.isArchived = true;
            }
        } else {
            // Default: exclude archived accounts
            query.isArchived = false;
        }

        const totalAdmins = await global.systemAdminModels.SystemAdminAccount.countDocuments(query);
        const admins = await global.systemAdminModels.SystemAdminAccount.find(query)
            .select('-password -twoFASecret -twoFAQRCode')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        res.status(200).json({
            success: true,
            admins,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalAdmins / limit),
                totalAdmins,
                limit: limit
            }
        });

    } catch (error) {
        console.error('Error fetching system admin accounts:', error);
        return res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};

// Get dashboard statistics
export const getDashboardStats = async (req, res) => {
    try {
        // Get total employees count
        const totalEmployees = await global.globalModels.EmployeeAccount.countDocuments({});

        // Get total system admins count
        const totalAdmins = await global.systemAdminModels.SystemAdminAccount.countDocuments({});

        // Get active accounts (not archived and not locked)
        // Using $ne: true to handle false, null, undefined, or missing fields
        const activeAccounts = await global.globalModels.EmployeeAccount.countDocuments({
            isArchived: { $ne: true },
            isLocked: { $ne: true }
        });

        // Get locked accounts
        const lockedAccounts = await global.globalModels.EmployeeAccount.countDocuments({
            isLocked: true
        });

        // Get archived accounts
        const archivedAccounts = await global.globalModels.EmployeeAccount.countDocuments({
            isArchived: true
        });

        // Get recent actions from the past hour
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        const recentActions = await global.globalModels.GranularLog.countDocuments({
            createdAt: { $gte: oneHourAgo }
        });

        res.status(200).json({
            success: true,
            stats: {
                totalEmployees,
                totalAdmins,
                activeAccounts,
                lockedAccounts,
                archivedAccounts,
                recentActions
            }
        });

    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch dashboard statistics.' 
        });
    }
};




