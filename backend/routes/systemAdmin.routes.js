import express from 'express';

import { 
    register,
    registerSystemAdmin,
    changeUserEmail,
    changeUserName,
    changeUserPhone,
    changeUserRoles,
    changeUserOfficePosition,
    changeUserPassword,
    resetUser2FA,
    archiveUserAccount,
    lockUserAccount,
    getActionLogs,
    getEmployeeAccounts,
    getSystemAdminAccounts
} from '../controller/system admin/systemAdmin.controller.js';

import { verifyAuthToken } from '../middleware/verifyToken.js';
import { verifyAccountType } from '../middleware/verifyRole.js';

const router = express.Router();

// All routes require authentication and SYSTEM_ADMIN account type
const systemAdminAuth = [verifyAuthToken, verifyAccountType(['admin'])];

// Employee account management
router.post('/register-employee', register);
router.put('/change-email', changeUserEmail);
router.put('/change-name', changeUserName);
router.put('/change-phone', changeUserPhone);
router.put('/change-roles', changeUserRoles);
router.put('/change-office-position', changeUserOfficePosition);
router.put('/change-password', changeUserPassword);
router.put('/reset-2fa', resetUser2FA);
router.put('/archive-account', archiveUserAccount);
router.put('/lock-account', lockUserAccount);

// System admin account management
router.post('/register-system-admin', registerSystemAdmin);

// Logs and data retrieval
router.get('/action-logs', getActionLogs);
router.get('/employee-accounts', getEmployeeAccounts);
router.get('/system-admin-accounts', getSystemAdminAccounts);

export default router;