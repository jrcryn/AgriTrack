import mongoose from 'mongoose';

// Extension ticket sub-schema
export const extensionTicketSchema = new mongoose.Schema({
    refNumber: { type: String, required: true },
    areaServiced: { type: Number, required: true },
    remainingArea: { type: Number, required: true },
    extensionReason: String,
    requestedDate: { type: Date, default: Date.now },
    
    status: { 
        type: String, 
        enum: [
            'Pending', 
            'Approved', 
            'Scheduled', 
            'Ongoing', 
            'Completed', 
            'Declined', 
            'No Proof Submitted', 
            'Completed (Delayed Submission)'
        ],
        default: 'Pending'
    },

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
        plateNumber: String, 
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
}, { _id: true, timestamps: true });




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
    status: { type: String, enum: ['Pending', 'Scheduled', 'Ongoing' , 'Completed', 'Declined'] },
    disabledForEditing: Boolean,

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
        plateNumber: String, 
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

    extensionNeeded: Boolean,
    
    extensionDetails: {
        areaServiced: Number,
        remainingArea: Number
    },

    remarks: String,

    extensionTickets: [extensionTicketSchema],
}, { versionKey: false, timestamps: true });