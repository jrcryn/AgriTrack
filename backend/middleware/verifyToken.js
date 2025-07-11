import jwt from 'jsonwebtoken';

export const verifyAuthToken = (req, res, next) => {

    const token = req.cookies.authToken;

    if (!token) return res.status(401).json({ success: false, message: 'Unauthorized. Login again.' });

    try {
        req.decodedAuthToken = jwt.verify(token, process.env.JWT_SECRET);

        next();
    } catch {
        return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
    }
};

export const verifyPreAuthToken = (req, res, next) => {

    const token = req.cookies.preAuthToken;

    if (!token) return res.status(401).json({ success: false, message: 'Unauthorized. Login again.' });

    try {
        req.decodedPreAuthToken = jwt.verify(token, process.env.JWT_SECRET);

        next();
    } catch {
        return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
    }
};