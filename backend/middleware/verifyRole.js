export const verifyRole = ( allowedRoles = [] ) => {
  return (req, res, next) => {
    const role = req.decodedAuthToken.payload.role;

    if (!allowedRoles.includes(role)) {
      return res.status(403).json({ success: false, message: 'Access denied: Unauthorized role.' });
    }

    next();
  };
};

export const verifyAccountType = ( allowedAccountTypes = [] ) => {
  return (req, res, next) => {
    const accountType = req.decodedAuthToken.payload.accountType;

    if (!allowedAccountTypes.includes(accountType)) {
      return res.status(403).json({ success: false, message: 'Access denied: Unauthorized account type.' });
    }

    next();
  };
};