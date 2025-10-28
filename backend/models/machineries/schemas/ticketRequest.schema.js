import mongoose from 'mongoose';

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
    status: { type: String, enum: ['Pending', 'Scheduled', 'Ongoing' ,'Declined'] },

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
    }
}, { versionKey: false, timestamps: true });