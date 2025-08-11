export const ensureHvcFormOpen = async (req, res, next) => {
  try {
    const statusDoc = await global.highValueCropsModels.FormStatus.findOne({});
    const isOpen = Boolean(statusDoc?.formStatus);
    if (!isOpen) {
      return res.status(403).json({ success: false, message: 'High-Value Crops form is currently disabled.' });
    }
    next();
  } catch (error) {
    return res.status(500).json({ message: 'Error verifying form status', error: error.message });
  }
};