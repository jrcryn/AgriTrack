import jwt from 'jsonwebtoken';

const isProductionEnv = () => {
    return process.env.NODE_ENV === 'production' || !!process.env.VERCEL || !!process.env.VERCEL_ENV;
};

export const generateTokenAndSetCookie = (res, userId, role, accountType = 'employee') => {

    if (!userId || !role) {
        throw new Error('User ID and role are required to generate token and set cookie');
    }

    const payload = {
        userId,
        role, // Include role in the payload for API route authorization check, and para narin sa frontend, kasi dynamic yung render ng sidebar buttons based sa role.
        accountType // Include accountType to distinguish between employee and admin accounts
    };
    const token = jwt.sign({ payload }, process.env.JWT_SECRET, { expiresIn: '4h' });
    const isProd = isProductionEnv();

    res.cookie('authToken', token, {
        httpOnly: true,
        secure: isProd ? true : false, // Set to true in production/Vercel for secure cookies
        sameSite: isProd ? 'None' : 'Lax', // Use 'None' for cross-site cookies in production/Vercel
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    return token;
};

// Strict - the cookie is only sent in same-site requests. Meaning it will completely block cross-stite requests. It is secure, althoug may break functionality that has external redirects or cross-site requests.
// Lax - the cookie is sent in same-site requests and with top-level navigations. It is less secure than Strict, but allows some cross-site functionality.
// None - the cookie is sent in all requests, regardless of the origin. It is the least secure option, but necessary for cross-site requests in some cases, especially with third-party services.

/* Kaya sa productiona and staging services sa Render, naka set and sameSite into Lax, because we need to allow cross-site requests kasi nga diba magkahiwalay yung service
ng frontend and backend, meaning magkaiba sila ng domains, even if both are hosted sa Render. Kaya kailangan naka set sa Lax para ma allow yung cross-site requests.*/

/* Pero dapat naka set yung secure to 'true' because browsers will block cookies unless it is only sent over HTTPS. (If sameSite === 'None' then secure === 'true') */

/* That is why ren, in local development, we set it to Strict, because we don't need cross-site requests, and nag ra-run naman tayo sa same domain.*/