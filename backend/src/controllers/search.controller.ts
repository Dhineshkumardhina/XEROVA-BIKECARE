import { Request, Response } from 'express';
import { searchService } from '../services/search.service.js';
import { sendSuccess } from '../utils/response.js';

export class SearchController {
  async globalSearch(req: Request, res: Response) {
    const q = (req.query.q as string) || '';
    const limit = Number(req.query.limit) || 6;
    const results = await searchService.globalSearch(q, limit);
    return sendSuccess(res, results, 'Search results retrieved');
  }
}

export const searchController = new SearchController();
