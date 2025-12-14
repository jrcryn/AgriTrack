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
            await logAction(req, userId, 'USER_REGISTER', 'SYSTEM ADMIN', `Registration attempt failed - System admin already exists: ${email}`, 'VALIDATION_FAILED');
            return res.status(400).json({ success: false, message: 'System admin already exists.' });
        }

        if (!first_name || !last_name || !email || !phone) {
            await logAction(req, userId, 'USER_REGISTER', 'SYSTEM ADMIN', `Registration attempt failed - Missing required fields for email: ${email || 'unknown'}`, 'VALIDATION_FAILED');
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
        
        await logAction(req, userId, 'USER_REGISTER', 'SYSTEM ADMIN', `System admin registered: ${email}`, 'SUCCESS');

        res.status(201).json({ 
            message: 'System admin registered successfully', 
            success: true,
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
            await logAction(req, userId, 'USER_REGISTER', 'SYSTEM ADMIN', `Registration failed - System admin already exists: ${req.body.email}`, 'FAILED');
            return res.status(400).json({ success: false, message: 'System admin already exists.' });
        }

        await logAction(req, userId, 'USER_REGISTER', 'SYSTEM ADMIN', `Registration error: ${error.message}`, 'FAILED');

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

// Fetch action logs with pagination and search
export const getActionLogs = async (req, res) => {
    const userId = req.decodedAuthToken.payload.userId;
    const { page = 1, limit = 20, search = '', action = '', module = '', status = '' } = req.query;

    try {
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

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

        const totalLogs = await global.globalModels.GranularLog.countDocuments(query);
        const logs = await global.globalModels.GranularLog.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum)
            .populate('userId', 'first_name last_name email')
            .lean();

        await logAction(req, userId, 'LOGS_FETCHED', 'SYSTEM ADMIN', `Action logs fetched - Page ${pageNum}, Limit ${limitNum}`, 'SUCCESS');

        res.status(200).json({
            success: true,
            logs,
            pagination: {
                currentPage: pageNum,
                totalPages: Math.ceil(totalLogs / limitNum),
                totalLogs,
                limit: limitNum
            }
        });

    } catch (error) {
        await logAction(req, userId, 'LOGS_FETCHED', 'SYSTEM ADMIN', `Fetch logs error: ${error.message}`, 'FAILED');
        console.error('Error fetching logs:', error);
        return res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};



