import mongoose from 'mongoose';

export const ticketRequestSchema = new mongoose.Schema({
    farmerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Farmer_Account',
        required: true
    },
    requestorFarmer: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Farmer_Account',
        required: true
    },
    requestedMachineType: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Machine_Type',
        required: true
    },
    assignedMachineUnit: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Machine_Unit',
    },
    assignedOperator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Staff_Account',
    },
    
    barangay: {type: String, required: true},
    estimatedArea: { type: Number, required: true},
    dateRequested: {type: Date, required: true},
    status: { type: String, required: true, enum: ['Pending', 'Scheduled', 'Ongoing' ,'Declined'], default: 'Pending'},

    // to be filled in when a schedule is created
    scheduleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Request_Schedule',
    },
    assignedMachineUnitId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Machine_Unit',
    },
    assignedOperatorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Staff_Account',
    }
}, { versionKey: false }, { timestamps: true });