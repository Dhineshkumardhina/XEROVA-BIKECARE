import { Request, Response, NextFunction } from 'express';
import { accountService } from '../services/account.service.js';
import {
  createReceiptSchema,
  createPaymentSchema,
  reverseVoucherSchema,
  createDepositSchema,
  createWithdrawalSchema,
  createTransferSchema,
  reconcileTransactionSchema
} from '../validators/account.validator.js';
import { sendCreated, sendSuccess } from '../utils/response.js';

export class AccountController {
  async createReceipt(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = createReceiptSchema.parse(req.body);
      const user = (req as any).user;
      const actor = user ? { userId: user.userId || user.id, username: user.username } : undefined;
      const result = await accountService.createReceipt(validated, actor);
      return sendCreated(res, result, `Receipt voucher ${result.receiptNo} created successfully`);
    } catch (error) {
      return next(error);
    }
  }

  async createPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = createPaymentSchema.parse(req.body);
      const user = (req as any).user;
      const actor = user ? { userId: user.userId || user.id, username: user.username } : undefined;
      const result = await accountService.createPayment(validated, actor);
      return sendCreated(res, result, `Payment voucher ${result.paymentNo} created successfully`);
    } catch (error) {
      return next(error);
    }
  }

  async reverseReceipt(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = reverseVoucherSchema.parse(req.body);
      const user = (req as any).user;
      const actor = user ? { userId: user.userId || user.id, username: user.username } : undefined;
      const result = await accountService.reverseReceipt(validated, actor);
      return sendSuccess(res, result, `Receipt ${result.receiptNo} reversed successfully`);
    } catch (error) {
      return next(error);
    }
  }

  async reversePayment(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = reverseVoucherSchema.parse(req.body);
      const user = (req as any).user;
      const actor = user ? { userId: user.userId || user.id, username: user.username } : undefined;
      const result = await accountService.reversePayment(validated, actor);
      return sendSuccess(res, result, `Payment ${result.paymentNo} reversed successfully`);
    } catch (error) {
      return next(error);
    }
  }

  async getDashboardSummary(_req: Request, res: Response, next: NextFunction) {
    try {
      const summary = await accountService.getDashboardSummary();
      return sendSuccess(res, summary, 'Accounts dashboard metrics fetched successfully');
    } catch (error) {
      return next(error);
    }
  }

  async getCustomerLedger(req: Request, res: Response, next: NextFunction) {
    try {
      const { customerId } = req.params;
      const ledger = await accountService.getCustomerLedger(customerId);
      return sendSuccess(res, ledger, 'Customer ledger fetched successfully');
    } catch (error) {
      return next(error);
    }
  }

  async createDeposit(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = createDepositSchema.parse(req.body);
      const user = (req as any).user;
      const actor = user ? { userId: user.userId || user.id, username: user.username } : undefined;
      const result = await accountService.createDeposit(validated, actor);
      return sendCreated(res, result, `Cash deposit ${result.reference} processed successfully`);
    } catch (error) {
      return next(error);
    }
  }

  async createWithdrawal(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = createWithdrawalSchema.parse(req.body);
      const user = (req as any).user;
      const actor = user ? { userId: user.userId || user.id, username: user.username } : undefined;
      const result = await accountService.createWithdrawal(validated, actor);
      return sendCreated(res, result, `Cash withdrawal ${result.reference} processed successfully`);
    } catch (error) {
      return next(error);
    }
  }

  async createTransfer(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = createTransferSchema.parse(req.body);
      const user = (req as any).user;
      const actor = user ? { userId: user.userId || user.id, username: user.username } : undefined;
      const result = await accountService.createTransfer(validated, actor);
      return sendCreated(res, result, `Fund transfer ${result.reference} processed successfully`);
    } catch (error) {
      return next(error);
    }
  }

  async reconcileTransaction(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = reconcileTransactionSchema.parse(req.body);
      const user = (req as any).user;
      const actor = user ? { userId: user.userId || user.id, username: user.username } : undefined;
      const result = await accountService.reconcileTransaction(validated, actor);
      return sendSuccess(res, result, `Bank transaction ${result.transactionId} reconciled successfully`);
    } catch (error) {
      return next(error);
    }
  }
}

export const accountController = new AccountController();
