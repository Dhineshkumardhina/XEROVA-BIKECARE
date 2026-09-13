import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service.js';
import { userService } from '../services/user.service.js';
import { sendSuccess } from '../utils/response.js';
import { loginSchema, refreshTokenSchema, changePasswordSchema } from '../validators/auth.validator.js';
import { AuthenticatedRequest } from '../types/index.js';

export class AuthController {
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedInput = loginSchema.parse(req.body);
      const ipAddress = req.ip || req.socket.remoteAddress;
      const userAgent = req.headers['user-agent'];

      const result = await authService.login(validatedInput, ipAddress, userAgent);
      return sendSuccess(res, result, 'Authentication successful');
    } catch (error) {
      next(error);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedInput = refreshTokenSchema.parse(req.body);
      const result = await authService.refreshToken(validatedInput.refreshToken);
      return sendSuccess(res, result, 'Token refreshed successfully');
    } catch (error) {
      next(error);
    }
  }

  async me(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      return sendSuccess(res, { user: req.user }, 'Current user profile');
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const validatedInput = changePasswordSchema.parse(req.body);
      const result = await userService.changePassword(
        req.user!.userId,
        validatedInput.oldPassword,
        validatedInput.newPassword
      );
      return sendSuccess(res, result, 'Password changed successfully');
    } catch (error) {
      next(error);
    }
  }

  async logout(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (req.user?.userId) {
        await authService.logout(req.user.userId);
      }
      return sendSuccess(res, null, 'Logged out successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();

