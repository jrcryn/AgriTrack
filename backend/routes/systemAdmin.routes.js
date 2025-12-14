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
    getActionLogs
} from '../controller/system admin/systemAdmin.controller.js';

import { verifyAuthToken } from '../middleware/verifyToken.js';
import { verifyAccountType } from '../middleware/verifyRole.js';

const router = express.Router();

// All routes require authentication and SYSTEM_ADMIN account type
const systemAdminAuth = [verifyAuthToken, verifyAccountType(['admin'])];

// Employee account management
router.post('/register-employee', systemAdminAuth, register);
router.put('/change-email', systemAdminAuth, changeUserEmail);
router.put('/change-name', systemAdminAuth, changeUserName);
router.put('/change-phone', systemAdminAuth, changeUserPhone);
router.put('/change-roles', systemAdminAuth, changeUserRoles);
router.put('/change-office-position', systemAdminAuth, changeUserOfficePosition);
router.put('/change-password', systemAdminAuth, changeUserPassword);
router.put('/reset-2fa', systemAdminAuth, resetUser2FA);
router.put('/archive-account', systemAdminAuth, archiveUserAccount);
router.put('/lock-account', systemAdminAuth, lockUserAccount);

// System admin account management
router.post('/register-system-admin', systemAdminAuth, registerSystemAdmin);

// Action logs
router.get('/action-logs', systemAdminAuth, getActionLogs);

export default router;