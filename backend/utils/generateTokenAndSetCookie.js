import jwt from 'jsonwebtoken';

export const generateTokenAndSetCookie = (res, userId, role) => {

    if (!userId || !role) {
        throw new Error('User ID and role are required to generate token and set cookie');
    }

    const payload = {
        userId,
        role,
    };
    const token = jwt.sign({ payload }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.cookie('authToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
        sameSite: 'Strict',
        maxAge: 1 * 24 * 60 * 60 * 1000 
    });

    return token;
};