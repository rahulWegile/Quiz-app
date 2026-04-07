// middlewares/rateLimiter.middleware.js
import rateLimit from 'express-rate-limit'

// Login — prevent brute-force password attacks
export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,        // 15 minutes
    max: 10,                           // 10 attempts per window
    message: { success: false, message: "Too many login attempts. Try again in 15 minutes." },
    standardHeaders: true,
    legacyHeaders: false,
})

// Forgot password — prevent email flooding
export const forgotPassLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,         // 1 hour
    max: 5,                            // 5 requests per window
    message: { success: false, message: "Too many password reset requests. Try again in 1 hour." },
    standardHeaders: true,
    legacyHeaders: false,
})

// Resend code — prevent OTP spam
export const resendCodeLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,         // 10 minutes
    max: 3,                            // 3 resends per window
    message: { success: false, message: "Too many code requests. Try again in 10 minutes." },
    standardHeaders: true,
    legacyHeaders: false,
})