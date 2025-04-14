import mongoose from "mongoose";

// holders para sa 3 database connections
const connections = {};

export const connectDB = async() => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${mongoose.connection.host}`);
        
        // Use different databases on the same connection
        connections.highValueCropsDb = mongoose.connection.useDb('high-value-crops');
        connections.docTrackDb = mongoose.connection.useDb('doc-track');
        connections.machineriesDb = mongoose.connection.useDb('machineries');
        
        console.log(`Multiple databases initialized: ${connections.highValueCropsDb.name}, ${connections.docTrackDb.name}, ${connections.machineriesDb.name}`);
        
    } catch (error) {
        console.error(`Error: ${error}`);
        process.exit(1); // Exit process with failure
    }
};

// Export function to get database connections
export const getConnections = () => connections;