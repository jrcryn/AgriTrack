export const logAction = async (req, userId, action, module, description, status) => {
  try {
    const ip = req?.ip || req?.headers?.['x-forwarded-for'] || req?.connection?.remoteAddress || 'Unknown';
    const userAgent = req?.headers?.['user-agent'] || 'Unknown';

    await global.globalModels.GranularLog.create({
      userId,
      action,
      module,
      description,
      status,
      ip,
      userAgent,
    });
  } catch (error) {
    console.error(`[Granular Logging Error] Failed to log action '${action}':`, error.message);
  }
};
