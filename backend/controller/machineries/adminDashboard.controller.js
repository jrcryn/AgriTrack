export const addMachineriesUnit = async (req, res) => {
    const { unit_name, remarks, barangay_allocations } = req.body;

    if (!unit_name  || !barangay_allocations) {
        return res.status(400).json({ message: "Please provide all the required fields." });
    };


    const existingUnit = await global.machineriesModels.MachineriesUnit.findOne({ unit_name });
    if (existingUnit) {
        return res.status(400).json({ message: "Machinery unit already exists." });
    };


    try {
        const newMachineriesUnit = await global.machineriesModels.MachineriesUnit.create({
            unit_name,
            remarks,
            barangay_allocations
        });
        return res.status(200).json({ 
            message: "Machineries unit added successfully.",
            data: newMachineriesUnit
         });
    } catch (error) {
        console.error("Error adding machinery unit:", error);
        return res.status(500).json({ message: "Error adding machinery unit." });
    }
};

export const getMachineriesUnits = async (req, res) => {
    try {
        const machineryUnits = await global.machineriesModels.MachineriesUnit.find().lean();
        res.json(machineryUnits);
    } catch (error) {
        res.status(500).json({ message: "Error fetching machinery units.", error: error.message });
    }
    
};


export const transferMachineriesUnit = async (req, res) => {
    const {machineryId, transferFrom, transferTo, unitCount, unitType} = req.body;

    if (!machineryId || !transferFrom || !transferTo || !unitCount || !unitType) {
        return res.status(400).json({message: "Please provide all the required data."});
    };
    
    // Validate unitType
    if (unitType !== 'functional_units' && unitType !== 'non_functional_units') {
        return res.status(400).json({message: "Unit type must be a functional unit or non functional unit'."});
    }

    // Validate unitCount
    if (isNaN(unitCount) || unitCount <= 0) {
        return res.status(400).json({message: "Unit count must be a positive number."});
    }

    try {
        // Find the machinery unit by ID
        const machinery = await global.machineriesModels.MachineriesUnit.findById(machineryId);
        
        if (!machinery) {
            return res.status(404).json({message: "Machinery unit not found."});
        }

        // Find source barangay in allocations
        const sourceIndex = machinery.barangay_allocations.findIndex(
            allocation => allocation.barangay === transferFrom
        );
        
        if (sourceIndex === -1) {
            return res.status(404).json({message: `Source barangay '${transferFrom}' not found in machinery allocations.`});
        }

        // Check if source has enough units to transfer
        if (machinery.barangay_allocations[sourceIndex][unitType] < unitCount) {
            return res.status(400).json({
                message: `Not enough ${unitType === 'functional_units' ? 'functional' : 'non-functional'} units available in ${transferFrom}.`
            });
        }

        // Find destination barangay in allocations
        let destIndex = machinery.barangay_allocations.findIndex(
            allocation => allocation.barangay === transferTo
        );
        
        // If destination barangay doesn't exist, add it
        if (destIndex === -1) {
            machinery.barangay_allocations.push({
                barangay: transferTo,
                total_units: 0,
                functional_units: 0,
                non_functional_units: 0
            });
            destIndex = machinery.barangay_allocations.length - 1;
        }

        // Update source barangay allocation
        machinery.barangay_allocations[sourceIndex][unitType] -= unitCount;
        machinery.barangay_allocations[sourceIndex].total_units -= unitCount;

        // Update destination barangay allocation
        machinery.barangay_allocations[destIndex][unitType] += unitCount;
        machinery.barangay_allocations[destIndex].total_units += unitCount;

        // Save the updated machinery
        await machinery.save();

        return res.status(200).json({
            message: `Successfully transferred ${unitCount} ${unitType === 'functional_units' ? 'functional' : 'non-functional'} units from ${transferFrom} to ${transferTo}.`,
            data: machinery
        });
    } catch (error) {
        console.error("Error transferring machinery units:", error);
        return res.status(500).json({
            message: "Error transferring machinery units.", 
            error: error.message
        });
    }
};


