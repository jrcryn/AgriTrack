import { getMachineriesDB } from "../../config/dbAccessHelper.js";

import { MachineriesTypeSchema } from "./schemas/machineriesType.schema.js";
import { MachineriesUnitSchema } from "./schemas/machineriesUnit.schema.js";
import { ticketRequestSchema } from "./schemas/ticketRequest.schema.js"
import { WeeklyScheduleSchema } from "./schemas/weeklySchedule.schema.js";
import { tripTicketSchema } from "./schemas/tripTicket.schema.js";
import { FormStatus } from "./schemas/formStatus.js";
export const initializeMachineriesModels = () => {
    const db = getMachineriesDB();

    return {
        MachineriesType: db.model("Machine_Type", MachineriesTypeSchema),
        MachineriesUnit: db.model("Machine_Unit", MachineriesUnitSchema),
        TicketRequest: db.model("Ticket_Request", ticketRequestSchema),
        WeeklySchedule: db.model("Weekly_Schedule", WeeklyScheduleSchema),
        TripTciket: db.model("Trip_Ticket", tripTicketSchema),
        FormStatus: db.model('FormStatus', FormStatus),
    }
};