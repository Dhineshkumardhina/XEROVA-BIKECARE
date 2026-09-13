import { Router } from 'express';
import { searchController } from '../controllers/search.controller.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();

router.use(authenticate);

// Global Omnibox Search (Ctrl + K)
router.get('/', searchController.globalSearch.bind(searchController));

export default router;
