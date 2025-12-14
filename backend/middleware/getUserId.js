/**
 * Middleware to extract and attach userId to the request object
 * This should be used AFTER verifyAuthToken middleware
 * 
 * Usage:
 * import { getUserId } from './middleware/getUserId.js';
 * router.get('/some-route', verifyAuthToken, getUserId, controller);
 * 
 * Then in your controller, you can access: req.userId
 */

export const getUserId = (req, res, next) => {
    try {
        // Extract userId from the decoded JWT token
        // The token structure is: { payload: { userId, role } }
        if (req.decodedAuthToken && req.decodedAuthToken.payload && req.decodedAuthToken.payload.userId) {
            req.userId = req.decodedAuthToken.payload.userId;
            next();
        } else {
            return res.status(401).json({ 
                success: false, 
                message: 'User ID not found in token. Please login again.' 
            });
        }
    } catch (error) {
        console.error('Error extracting user ID:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Error processing user authentication.' 
        });
    }
};

/**
 * Optional middleware that attempts to get userId but doesn't fail if not found
 * Useful for routes that work for both authenticated and unauthenticated users
 * 
 * Usage:
 * router.get('/public-route', getUserIdOptional, controller);
 * 
 * Then in controller: req.userId will be set if authenticated, or null if not
 */
export const getUserIdOptional = (req, res, next) => {
    try {
        if (req.decodedAuthToken && req.decodedAuthToken.payload && req.decodedAuthToken.payload.userId) {
            req.userId = req.decodedAuthToken.payload.userId;
        } else {
            req.userId = null;
        }
        next();
    } catch (error) {
        req.userId = null;
        next();
    }
};
