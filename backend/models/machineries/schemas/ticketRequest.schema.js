import mongoose from 'mongoose';

export const ticketRequestSchema = new mongoose.Schema({
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

    barangay: {type: String, required: true},
    estimatedArea: { type: Number, required: true},
    dateRequested: {type: Date, required: true},
    status: { type: String, enum: ['Pending', 'Scheduled', 'Ongoing' ,'Declined'] },

    // to be filled in when a schedule is created
    scheduleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Request_Schedule',
    },
    assignedDate: Date,
    assignedMachineUnitId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Machine_Unit',
    },
    assignedOperatorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Staff_Account',
    }
}, { versionKey: false }, { timestamps: true });