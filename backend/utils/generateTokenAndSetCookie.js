import jwt from 'jsonwebtoken';

export const generateTokenAndSetCookie = (res, userId, role) => {

    if (!userId || !role) {
        throw new Error('User ID and role are required to generate token and set cookie');
    }

    const payload = {
        userId,
        role, // Include role in the payload for API route authorization check, and para narin sa frontend, kasi dynamic yung render ng sidebar buttons based sa role.
    };
    const token = jwt.sign({ payload }, process.env.JWT_SECRET, { expiresIn: '4h' });

    res.cookie('authToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production' ? true : false, // Set to true in production for secure cookies
        sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Strict', // Use 'None' for cross-site cookies in production, 'Strict' for local development
        maxAge: 4 * 60 * 60 * 1000, // 4 hours in milliseconds
    });

    return token;
};