export const logAction = async (req, userId, action, module, description, status) => {
  await global.globalModels.GranularLog.create({
    userId,
    action,
    module,
    description,
    status,
    ip: req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress,
    userAgent: req.headers['user-agent'],
  });
};
