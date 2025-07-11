import jwt from 'jsonwebtoken';

export const generatePreTokenAndSetCookie = (res, userId) => {

    if (!userId) {
        throw new Error('User ID is required to generate pre-token and set cookie');
    };

    const preToken = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '5m' });

    res.cookie('preAuthToken', preToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
        maxAge: 5 * 60 * 1000 
    });

    return preToken;
};