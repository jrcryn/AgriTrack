import mongoose from "mongoose";

export const getFarmerAccountByName = async (req, res) => {
  const { surname, first_name, middle_name, suffix, farmer_barangay } = req.body;

  if (!surname || !first_name || !farmer_barangay) {
    return res.status(400).json({ message: 'Surname, first name, and barangay are required.' });
  }

  try {
    const query = {
      surname: { $regex: `^${surname.trim()}$`, $options: 'i' },
      first_name: { $regex: `^${first_name.trim()}$`, $options: 'i' },
      farmer_barangay,
    };

    if (middle_name && middle_name.trim() !== '') {
      query.middle_name = { $regex: `^${middle_name.trim()}$`, $options: 'i' };
    } else {
      query.$or = [{ middle_name: '' }, { middle_name: { $exists: false } }];
    }

    if (suffix && suffix.trim() !== '') {
      query.suffix = suffix;
    } else {
      query.$or = [...(query.$or || []), { suffix: '' }, { suffix: { $exists: false } }];
    }

    const farmerAccount = await global.globalModels.FarmerAccount.findOne(query);

    if (!farmerAccount) {
      return res.status(404).json({ message: 'Farmer not found.' });
    }

    res.status(200).json(farmerAccount);
  } catch (error) {
    console.error('Error fetching farmer account:', error);
    res.status(500).json({ message: 'Error fetching farmer account.', error: error.message });
  }
};

export const deleteExpiredLogs = async (req, res) => {
  try {
    const result = await global.globalModels.GranularLog.deleteMany({
      logExpiry: { $lte: new Date() }
    });
    res.status(200).json({ message: 'Expired logs deleted successfully.', deletedCount: result.deletedCount });
  } catch (error) {
    console.error('Error deleting expired logs:', error);
    res.status(500).json({ message: 'Error deleting expired logs.', error: error.message });
  }
};