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
    machineryType: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Machinery_Type',
        required: true
    },
    estimatedArea: { type: Number, required: true},
    barangay: {type: String, required: true},
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