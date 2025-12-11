const actions = [
    // Authentication & Authorization
    'USER_REGISTER',
    'USER_LOGIN',
    'USER_LOGIN_FAILED',
    'USER_LOGOUT',
    'USER_SWITCH_ROLE',
    '2FA_SECRET_GENERATED',
    '2FA_VERIFICATION_SUCCESS',
    '2FA_VERIFICATION_FAILED',
    'PASSWORD_RESET_REQUESTED',
    'PASSWORD_RESET_COMPLETED',
    
    // User Settings
    'USER_PASSWORD_CHANGED',
    '2FA_SECRET_FETCHED',
    
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
    'FARMER_ACCOUNT_CREATED',
    'FARMER_ACCOUNT_UPDATED',
    'FARMER_ACCOUNT_ARCHIVED',
    'FARMER_ACCOUNT_UNARCHIVED',
    
    // High Value Crops - Responses
    'FARMER_RESPONSE_ARCHIVED',
    'FARMER_RESPONSE_UNARCHIVED',
    'FARMER_RESPONSE_FLAGGED',
    'FARMER_RESPONSE_UNFLAGGED',
    'FARMER_RESPONSE_SUBMIITED_TO_METRICS',
    
    // High Value Crops - Edit Requests
    'SMS_SENT_FOR_EDIT_REQUEST',
    'VALIDATION_VISIT_SCHEDULED_FOR_EDIT_REQUEST',
    'EDIT_REQUEST_CONSENT_HANDLED',
    'FARMER_RESPONSE_FIELDS_UPDATED',
    
    // High Value Crops - Validation
    'VALIDATION_VISIT_COMPLETED',
    'VALIDATION_VISIT_APPROVED',
    'VALIDATION_VISIT_REJECTED',
    
    // High Value Crops - Form Status
    'HVC_FORM_ENABLED',
    'HVC_FORM_DISABLED',
    
    // High Value Crops - Reports
    'HVC_SAMPR_REPORT_GENERATED',
    'HVC_PR_REPORT_GENERATED',
    
    /*-----------------------------------------------------------------------------------------*/ 

    // Document Tracking - Document Types
    'DOCUMENT_TYPE_CREATED',
    'DOCUMENT_TYPE_UPDATED',
    
    // Document Tracking - Document Management
    'DOCUMENT_REGISTERED',
    'DOCUMENT_FORWARDED',
    'DOCUMENT_REGISTERED_AND_FORWARDED',
    'DOCUMENT_RECEIVED',
    'DOCUMENT_ARCHIVED',
    'DOCUMENT_UNARCHIVED',
    'DOCUMENT_RELEASED',
    'DOCUMENT_UNRELEASED',
    'DOCUMENT_REROUTED',
    'DOCUMENT_DISPOSED',
    'DOCUMENT_DELETED',
    'DOCUMENT_QR_CODE_DOWNLOADED',
];

const GranularLogSchema = new mongoose.Schema({
  userId: { type: String },
  action: { type: String, required: true, enum: actions },
  module: { type: String }, // e.g. 'machinery', 'documents', 'users'
  description: { type: String }, 
  status: { type: String, enum: ['success', 'failed'] },
  ip: { type: String },
  userAgent: { type: String }, //what browser/device was used
  createdAt: { type: Date, default: Date.now },
  logExpiry: { type: Date, default: () => new Date(Date.now() + 1095*24*60*60*1000) }, // 3 years expiration
});
