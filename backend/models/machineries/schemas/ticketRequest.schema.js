import mongoose from 'mongoose';

// Extension ticket schema
export const extensionTicketSchema = new mongoose.Schema({
    refNumber: { type: String, required: true },
    areaServiced: { type: Number, required: true },
    remainingArea: { type: Number, required: true },
    assignedDate: Date,
    extensionReason: String,

    status: { 
        type: String, 
        enum: [
            'Pending', 
            'Scheduled', 
            'Ongoing', 
            'Completed',  
            'No Proof Submitted', 
            'Completed (Delayed Submission)'
        ],
        default: 'Pending'
    },

    declineReason: String,

    approvedBy: {
        employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee_Account' },
        first_name: String,
        last_name: String,
        middle_name: String,
        suffix: String,
        email: String,
        phone: String,
        approvedAt: Date
    },

    declinedBy: {
        employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee_Account' },
        first_name: String,
        last_name: String,
        middle_name: String,
        suffix: String,
        email: String,
        phone: String,
        declinedAt: Date
    },

    declineReason: String,

    scheduleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Weekly_Schedule',
    },

    assignedDate: Date,

    assignedMachineUnit: {
        assignedMachineUnitId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Machine_Unit',
        },
        unitNumber: String, 
        engineBrand: String,
        engineHorsepower: String
    },

    assignedOperator: {
        assignedOperatorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Staff_Account',
        },
        first_name: String,
        last_name: String,
        middle_name: String,
        suffix: String,
        email: String,
        phone: String
    },

    completionProof: {
        proofImageId: String,
        proofImageUrl: String,
        signatureId: String,
        signatureUrl: String,
        completedAt: Date,
    },

    remarks: String,
}, { _id: true, timestamps: false });




export const ticketRequestSchema = new mongoose.Schema({
    requestorFarmer: {
        requestorFarmerId: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Farmer_Account',
            required: true
        },
        farmerId: String,
        surname: String,
        first_name: String,
        middle_name: String,
        suffix: String,
    },
    requestedMachineType: {
        requestedMachineTypeId: { 
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Machine_Type',
            required: true
        },
        ownerName: String,
        ownerType: String,
        equipmentType: String,
        ratedCapacity: String
    },
    
    refNumber: { type: String, required: true, unique: true },
    barangay: {type: String, required: true},
    estimatedArea: { type: Number, required: true},
    dateRequested: {type: Date, required: true},
    status: { 
        type: String, 
        enum: [
            'Pending',  
            'Scheduled', 
            'Ongoing', 
            'Completed', 
            'No Proof Submitted', 
            'Completed (Delayed Submission)',
            'Partially Completed'
        ],
    },
    disabledForEditing: Boolean,
    removedOutOfScheduleDueToExtension: Boolean,

    declinedBy: {
        employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee_Account' },
        first_name: String,
        last_name: String,
        middle_name: String,
        suffix: String,
        email: String,
        phone: String
    },

    declineReason: { type: String },

    // to be filled in when a schedule is created
    scheduleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Weekly_Schedule',
    },
    assignedDate: Date,
    assignedMachineUnit: {
        assignedMachineUnitId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Machine_Unit',
        },
        unitNumber: String,
        engineBrand: String,
        engineHorsepower: String
    },
    assignedOperator: {
        assignedOperatorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Staff_Account',
        },
        first_name: String,
        last_name: String,
        middle_name: String,
        suffix: String,
        email: String,
        phone: String
    },

    completionProof: {
        proofImageId: String,
        proofImageUrl: String,
        signatureId: String,
        signatureUrl: String,
        completedAt: Date,
    },

    completedBy: {
        operatorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Staff_Account',
        },
        first_name: String,
        last_name: String,
        middle_name: String,
        suffix: String,
        email: String,
        phone: String,
    },

    extensionNeeded: Boolean,

    remarks: String,

    extensionTicketId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Extension_Ticket',
    },
}, { versionKey: false, timestamps: true });