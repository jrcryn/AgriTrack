import mongoose from "mongoose";

const actions = [
    // Authentication & Authorization
    'USER_REGISTER', //DONE
    'USER_LOGIN', //DONE
    'USER_LOGOUT', //DONE
    'USER_SWITCH_ROLE', //DONE
    '2FA_SECRET_GENERATED', //DONE
    '2FA_VERIFIED', //DONE
    'PASSWORD_RESET_REQUESTED', //DONE
    'PASSWORD_RESET', //DONE
    

    /*-----------------------------------------------------------------------------------------*/

    
    // User Settings
    'USER_PASSWORD_CHANGED',
    '2FA_SECRET_FETCHED',
    
    /*-----------------------------------------------------------------------------------------*/

    // System Admin - User Management
    'USER_EMAIL_UPDATED',
    'USER_NAME_UPDATED',
    'USER_PHONE_UPDATED',
    'USER_ROLES_UPDATED',
    'USER_OFFICE_POSITION_UPDATED',
    'USER_2FA_RESET',
    'USER_ARCHIVED',
    'USER_LOCKED',
    
    /*-----------------------------------------------------------------------------------------*/


    // Machinery Management - Machinery Types & Units
    'MACHINERY_TYPE_CREATED',
    'MACHINERY_TYPE_UPDATED',
    'MACHINERY_UNIT_CREATED',
    'MACHINERY_UNIT_STATUS_UPDATED',
    
    // Machinery Management - Schedules & Tickets
    'TICKET_REQUEST_SUBMITTED',
    'WEEKLY_SCHEDULE_CREATED',
    'WEEKLY_SCHEDULE_UPDATED',
    'TICKET_REMOVED_FROM_SCHEDULE',
    'TICKET_MOVED_TO_SCHEDULE',
    'TICKET_REQUEST_COMPLETED',
    
    // Machinery Management - Extensions
    'EXTENSION_REQUEST_APPROVED',
    'EXTENSION_REQUEST_DECLINED',
    'EXTENSION_TICKET_COMPLETED',
    
    // Machinery Management - Operators
    'OPERATOR_DISABLED',
    'OPERATOR_ENABLED',
    'OPERATOR_LICENSE_ADDED',
    'OPERATOR_LICENSE_UPDATED',
    'OPERATOR_LICENSE_REMOVED',
    'EMPLOYEE_LEAVE_STATUS_SET',
    
    // Machinery Management - Incidents
    'INCIDENT_REPORT_DECLINED',
    'INCIDENT_REPORT_RESOLVED',
    'INCIDENT_REPORT_CONFIRMED',
    
    // Machinery Management - Physical Counting
    'MACHINE_COUNT_CHECK_PERFORMED',
    'PHYSICAL_COUNT_DISCREPANCY_RESOLVED',
    
    // Machinery Management - Form Status
    'MACHINERY_FORM_ENABLED',
    'MACHINERY_FORM_DISABLED',
    
    // Machinery Management - Reports
    'MACHINERY_USAGE_REPORT_GENERATED',

    /*-----------------------------------------------------------------------------------------*/ 

    // High Value Crops - Farmer Accounts
    'FARMER_ACCOUNT_CREATED', //DONE
    'FARMER_ACCOUNT_UPDATED', //DONE
    'FARMER_ACCOUNT_ARCHIVED', //DONE
    'FARMER_ACCOUNT_UNARCHIVED', //DONE
    
    // High Value Crops - Responses
    'FARMER_RESPONSE_ARCHIVED', //DONE
    'FARMER_RESPONSE_UNARCHIVED', //DONE
    'FARMER_RESPONSE_FLAGGED', //DONE
    'FARMER_RESPONSE_UNFLAGGED', //DONE
    'FARMER_RESPONSE_SUBMIITED_TO_METRICS', //DONE
    
    // High Value Crops - Edit Requests
    'SMS_SENT_FOR_EDIT_REQUEST', //DONE
    'VALIDATION_VISIT_SCHEDULED_FOR_EDIT_REQUEST', //DONE 
    
    // High Value Crops - Validation
    'VALIDATION_VISIT_COMPLETED', //DONE
    'FARMER_RESPONSE_FIELDS_UPDATED', //DONE
    
    'VALIDATION_VISIT_APPROVED', //DONE
    'VALIDATION_VISIT_REJECTED', //DONE
    
    // High Value Crops - Form Status
    'HVC_FORM_ENABLED', //DONE
    'HVC_FORM_DISABLED', //DONE
    
    // High Value Crops - Reports
    'HVC_SAMPR_REPORT_GENERATED',//DONE
    'HVC_PR_REPORT_GENERATED',//DONE
    
    /*-----------------------------------------------------------------------------------------*/ 

    // Document Tracking - Document Types
    'DOCUMENT_TYPE_CREATED', //DONE
    'DOCUMENT_TYPE_UPDATED', //DONE
    
    // Document Tracking - Document Management
    'DOCUMENT_REGISTERED', //DONE
    'DOCUMENT_FORWARDED', //DONE
    'DOCUMENT_REGISTERED_AND_FORWARDED', //DONE
    'DOCUMENT_RECEIVED', //DONE
    'DOCUMENT_ARCHIVED', //DONE
    'DOCUMENT_UNARCHIVED', //DONE
    'DOCUMENT_RELEASED', //DONE
    'DOCUMENT_UNRELEASED', //DONE
    'DOCUMENT_REROUTED', //DONE
    'DOCUMENT_DISPOSED', //DONE
    'DOCUMENT_DELETED', //DONE
    'DOCUMENT_QR_CODE_DOWNLOADED', //DONE
];

export const GranularLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'EmployeeAccount', required: true },
  action: { type: String, required: true, enum: actions },
  module: { type: String, required: true }, // e.g. 'machinery', 'documents', 'users'
  description: { type: String, required: true }, 
  status: { type: String, enum: ['SUCCESS', 'FAILED'], required: true },
  ip: { type: String, required: true },
  userAgent: { type: String, required: true }, //what browser/device was used
  createdAt: { type: Date, default: Date.now, required: true },
  logExpiry: { type: Date, default: () => new Date(Date.now() + 1095*24*60*60*1000), required: true }, // 3 years expiration
});
