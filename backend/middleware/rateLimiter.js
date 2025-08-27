import rateLimit from 'express-rate-limit';

export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit to 5 requests per IP 15 mins
    keyGenerator: (req) => req.body.email || req.ip,
    message: {
        success: false,
        message: 'Too many login attempts. Please try again after 15 minutes.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

export const verify2FALimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit to 5 requests per IP 15 mins
    message: {
        success: false,
        message: 'Too many 2FA verification attempts. Please try again after 15 minutes.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

export const forgotPasswordLimiter = rateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
    max: 3, // limit to 3 requests per IP per day
    keyGenerator: (req) => req.body.email || req.ip,
    message: {
        success: false,
        message: 'Too many password reset requests. Please try again after 24 hours.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});