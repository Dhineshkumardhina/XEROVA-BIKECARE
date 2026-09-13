import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';

export const apiRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP address, please try again later',
    code: 'RATE_LIMIT_EXCEEDED'
  }
});

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 failed login attempts per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please wait 15 minutes before trying again.',
    code: 'AUTH_RATE_LIMIT_EXCEEDED'
  }
});
