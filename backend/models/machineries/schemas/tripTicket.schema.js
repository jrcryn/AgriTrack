import mongoose from 'mongoose'

export const tripTicketSchema = new mongoose.Schema({
    ticketRequest: { 
        type: mongoose.Schema.Types.ObjectId, // Ref: TicketRequest (1:1)
        ref: 'Ticket_Request',
    },
    weeklySchedule: { 
        type: mongoose.Schema.Types.ObjectId, // for grouping under that week's schedule
        ref: 'Weekly_Schedule',
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
    utilizedMachineUnit: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Machine_Unit',
        plateNumber: String,
        engineBrand: String,
        engineHorsepower: Number
    },
    workedOperator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Staff_Account',
        first_name: String,
        last_name: String,
        middle_name: String,
        suffix: String,
        email: String,
        phone: { type: String, trim: true },
    },

    barangay: {type:String, required: true},
    dateServiced: {type: Date, required: true},
    areaServiced: {type: Number, required: true},

    status: { type: String, required: true, enum: ["Completed", "Partialy Completed", "Not Completed"]},
    remainingArea: { type: Number}, // how much area is still left to be serviced pag partially completed
    reasonIncomplete: {type: String}, //e.g., Rain, Tractor Breakdown, 


    farmerSignature: String,
    photoEvidence: [String],
    
    verifiedBy: {
        type: mongoose.Schema.Types.ObjectId, // Ref: TicketRequest (1:1)
        ref: 'Admin_Account',
        first_name: String,
        last_name: String,
        middle_name: String,
        suffix: String,
        email: String,
        phone: { type: String, trim: true },
    },
    verifiedAt: Date
});