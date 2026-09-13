import { Response } from 'express';
import { ApiResponse } from '../types/index.js';

export const sendSuccess = <T>(
  res: Response,
  data?: T,
  message?: string,
  statusCode = 200,
  meta?: ApiResponse['meta']
): Response => {
  const responseBody: ApiResponse<T> = {
    success: true,
    ...(message && { message }),
    ...(data !== undefined && { data }),
    ...(meta && { meta })
  };
  return res.status(statusCode).json(responseBody);
};

export const sendCreated = <T>(
  res: Response,
  data: T,
  message = 'Resource created successfully'
): Response => {
  return sendSuccess(res, data, message, 201);
};

export const sendError = (
  res: Response,
  message: string,
  statusCode = 400,
  code = 'BAD_REQUEST',
  errors?: any
): Response => {
  const responseBody: ApiResponse = {
    success: false,
    message,
    code,
    ...(errors && { errors })
  };
  return res.status(statusCode).json(responseBody);
};

export const sendUnauthorized = (
  res: Response,
  message = 'Authentication required',
  code = 'UNAUTHORIZED'
): Response => {
  return sendError(res, message, 401, code);
};

export const sendForbidden = (
  res: Response,
  message = 'Permission denied for this operational action',
  code = 'FORBIDDEN'
): Response => {
  return sendError(res, message, 403, code);
};

export const sendNotFound = (
  res: Response,
  message = 'Requested resource not found',
  code = 'NOT_FOUND'
): Response => {
  return sendError(res, message, 404, code);
};
