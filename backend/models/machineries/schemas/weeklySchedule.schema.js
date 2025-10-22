import mongoose from 'mongoose';

const tr = new mongoose.Schema({
    ticketRequestId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ticket_Request',
        required: true
    },
    assignedDate: { type: Date, required: true }
}, { _id: false });

export const WeeklyScheduleSchema = new mongoose.Schema({
    weekStart: {type: Date, required: true},
    weekEnd: {type: Date, required: true},
    ticketRequests: [tr],
    refNumber: {type: String, required: true, unique: true},

    status: {type: String, enum: ['Planned', 'In Progress', 'Completed']},

}, { versionKey: false }, { timestamps: true });

// problem: 