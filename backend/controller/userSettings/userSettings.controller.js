import bcrypt from "bcryptjs";
import { decrypt } from '../../utils/encryption.js';

export const changeUserPassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    try {
        const userId = req.decodedAuthToken.payload.userId;
        
        // Try to find user in EmployeeAccount first, then SystemAdminAccount
        let user = await global.globalModels.EmployeeAccount.findById(userId);
        if (!user) {
            user = await global.systemAdminModels.SystemAdminAccount.findById(userId);
        }
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordValid) {
            return res.status(404).json({ success: false, message: 'Incorrect current password.' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 12);
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({ success: true, message: 'Password changed successfully.' });
    } catch (error) {
        console.error('Error changing user password:', error);
        return res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};


export const get2FAsecret = async (req, res) => {
    const { password } = req.body;
    try {
        const userId = req.decodedAuthToken.payload.userId;
        
        // Try to find user in EmployeeAccount first, then SystemAdminAccount
        let user = await global.globalModels.EmployeeAccount.findById(userId);
        if (!user) {
            user = await global.systemAdminModels.SystemAdminAccount.findById(userId);
        }
        
        if (!user || !user.twoFAQRCode || !user.twoFASecret) {
            return res.status(404).json({ success: false, message: '2FA setup not found.' });
        } 

        if(!password) {
            return res.status(400).json({ success: false, message: 'Password is required to fetch 2FA setup.' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(404).json({ success: false, message: 'Incorrect password.' });
        }

        res.status(200).json({
            success: true,
            message: 'Fetched 2FA setup successfully.',
            qr: decrypt(user.twoFAQRCode),
            secret: decrypt(user.twoFASecret)
        });
    } catch (error) {
        console.error('Error retrieving 2FA secret:', error);
        return res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};