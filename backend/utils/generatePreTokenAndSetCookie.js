import jwt from 'jsonwebtoken';

export const generatePreTokenAndSetCookie = (res, userId) => {

    if (!userId) {
        throw new Error('User ID is required to generate pre-token and set cookie');
    };

    const preToken = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '5m' });

    res.cookie('preAuthToken', preToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production' ? true : false, // Set to true in production for secure cookies
        sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Strict', // Use 'None' for cross-site cookies in production, 'Strict' for local development
        maxAge: 5 * 60 * 1000 //5 minutes
    });

    return preToken;
};