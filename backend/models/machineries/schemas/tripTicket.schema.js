import mongoose from 'mongoose'

export const tripTicketSchema = new mongoose.Schema({
    ticketRequest: { 
        type: mongoose.Schema.Types.ObjectId, // Ref: TicketRequest (1:1)
        ref: 'Ticket_Request',
    },          
    assignedOperator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Staff_Account',
        first_name: String,
        last_name: String,
        middle_name: String,
        suffix: String,
        email: String,
        phone: { type: String, trim: true },
    },
    assignedMachineUnit: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Machine_Unit',
        plateNumber: String,
        engineBrand: String,
        engineHorsepower: Number
    },
    requestorFarmer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Farmer_Account',
        surname: String,
        first_name: String,
        middle_name: String,
        suffix: String,
        farmer_barangay: String,
        mobile_number: {type: String, trim: true},
        facebook: { type: String, trim: true },
        birthdate: { type: Date },
    },
    actualArea: {type: Number, required: true},
    barangay: {type:String, required: true},

    farmerSignature: String,
    photoEvidence: [String],
    completedAt: Date,
    verifiedBy: ObjectId,
    verifiedAt: Date
});