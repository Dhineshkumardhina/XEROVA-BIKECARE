import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import { verifyAccessToken } from '../utils/jwt.js';
import { sendUnauthorized } from '../utils/response.js';

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendUnauthorized(res, 'Authorization token required in Bearer format');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return sendUnauthorized(res, 'Bearer token is missing');
    }

    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      return sendUnauthorized(res, 'Session token expired. Please refresh your token.', 'TOKEN_EXPIRED');
    }
    return sendUnauthorized(res, 'Invalid authorization token', 'INVALID_TOKEN');
  }
};
