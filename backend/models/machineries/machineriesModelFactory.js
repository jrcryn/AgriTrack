import { getMachineriesDB } from "../../config/dbAccessHelper.js";

import { MachineriesUnitSchema } from "./schemas/machineriesUnit.schema.js";

export const initializeMachineriesModels = () => {
    const db = getMachineriesDB();

    return {
        MachineriesUnitSchema: db.model("Machineries_Unit", MachineriesUnitSchema),
    }
};