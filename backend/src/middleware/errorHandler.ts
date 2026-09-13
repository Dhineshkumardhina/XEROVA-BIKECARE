import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { sendError } from '../utils/response.js';
import { env } from '../config/env.js';

export class AppError extends Error {
  public statusCode: number;
  public code: string;

  constructor(statusCode: number, message: string, code: string = 'ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): Response => {
  // 1. Zod Validation Errors
  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message
    }));
    return sendError(
      res,
      'Validation failed for input data',
      422,
      'VALIDATION_ERROR',
      formattedErrors
    );
  }

  // 2. Prisma Database Errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // Unique constraint violation (e.g. duplicate SKU, mobile, GSTIN)
    if (err.code === 'P2002') {
      const target = (err.meta?.target as string[]) || ['Field'];
      return sendError(
        res,
        `Duplicate record error: A record with this ${target.join(', ')} already exists`,
        409,
        'DUPLICATE_RESOURCE',
        err.meta
      );
    }
    // Foreign key constraint failure
    if (err.code === 'P2003') {
      return sendError(
        res,
        'Cannot complete operation: Referenced entity does not exist',
        400,
        'FOREIGN_KEY_VIOLATION'
      );
    }
    // Record not found
    if (err.code === 'P2025') {
      return sendError(res, 'Record not found in database', 404, 'NOT_FOUND');
    }
  }

  // 3. Custom Business Error
  if (err.statusCode && err.message) {
    return sendError(
      res,
      err.message,
      err.statusCode,
      err.code || 'BUSINESS_RULE_VIOLATION'
    );
  }

  // 4. Fallback Generic Server Error (Never expose stack traces in production)
  console.error('💥 Unhandled Server Exception:', err);
  const message =
    env.NODE_ENV === 'production'
      ? 'An unexpected internal server error occurred'
      : err.message || 'Internal Server Error';

  return sendError(res, message, 500, 'INTERNAL_SERVER_ERROR');
};
