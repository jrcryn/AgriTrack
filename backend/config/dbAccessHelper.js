import { getConnections } from '../config/db.js';

// Helper functions to get specific database connections
export const getHighValueCropsDB = () => {
  const connections = getConnections();
  return connections.highValueCropsDb;
};

export const getDocTrackDB = () => {
  const connections = getConnections();
  return connections.docTrackDb;
};

export const getMachineriesDB = () => {
  const connections = getConnections();
  return connections.machineriesDb;
};