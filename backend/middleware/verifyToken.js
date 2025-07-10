import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {

    const authToken = req.cookies.authToken;

    try {
        if (!authToken) {
            return res.status(401).json({ success: false, message: 'Unauthorized - no token provided.' });
        }

        const decoded = jwt.verify(authToken, process.env.JWT_SECRET);

        if (!decoded) {
            return res.status(401).json({ success: false, message: 'Unauthorized - invalid token.' });
        }
        
        req.decodedToken = decoded; 
        next();

    } catch (error) {
        return res.status(401).json({ message: 'Internal server error.' });
    }
};