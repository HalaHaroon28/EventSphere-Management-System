import express from 'express';
import { getExpoAnalytics } from '../controllers/analyticsController.js';
import { protect } from '../middlewares/auth.js';
import { roleCheck } from '../middlewares/roleCheck.js';

const router = express.Router();

router.get('/expos/:expoId/analytics', protect, roleCheck('organizer'), getExpoAnalytics);

export default router;