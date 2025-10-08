import { getMachineriesDB } from "../../config/dbAccessHelper.js";

import { MachineriesTypeSchema } from "./schemas/machineriesType.schema.js";
import { MachineriesUnitSchema } from "./schemas/machineriesUnit.schema.js";
import { ticketRequestSchema } from "./schemas/ticketRequest.schema.js"
import { WeeklyScheduleSchema } from "./schemas/weeklySchedule.schema.js";
import { tripTicketSchema } from "./schemas/tripTicket.schema.js";

import { MachineriesAdminSchema } from "./schemas/machineriesAdminAccount.schema.js";
import { MachineriesStaffSchema } from "./schemas/machineriesStaffAccount.schema.js";

export const initializeMachineriesModels = () => {
    const db = getMachineriesDB();

    return {
        MachineriesType: db.model("Machine_Type", MachineriesTypeSchema),
        MachineriesUnit: db.model("Machine_Unit", MachineriesUnitSchema),
        TicketRequest: db.model("Ticket_Request", ticketRequestSchema),
        WeeklySchedule: db.model("Weekly_Schedule", WeeklyScheduleSchema),
        TripTciket: db.model("Trip_Ticket", tripTicketSchema),

        ManagerAccount: db.model("Admin_Account", MachineriesAdminSchema),
        StaffAccount: db.model("Staff_Account", MachineriesStaffSchema)
    }
};