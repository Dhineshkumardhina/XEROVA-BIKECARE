import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../config/env.js';
import { AuthenticatedUserPayload } from '../types/index.js';

export const generateAccessToken = (payload: AuthenticatedUserPayload): string => {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as any
  });
};

export const generateRefreshToken = (userId: string): string => {
  return jwt.sign({ userId, jti: crypto.randomUUID() }, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as any
  });
};

export const verifyAccessToken = (token: string): AuthenticatedUserPayload => {
  return jwt.verify(token, env.JWT_SECRET) as AuthenticatedUserPayload;
};

export const verifyRefreshToken = (token: string): { userId: string; jti?: string } => {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as { userId: string; jti?: string };
};

