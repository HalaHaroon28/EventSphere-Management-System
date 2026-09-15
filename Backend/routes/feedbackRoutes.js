import express from 'express';
import { submitFeedback, listFeedback, resolveFeedback } from '../controllers/feedbackController.js';
import { protect, optionalAuth } from '../middlewares/auth.js';
import { roleCheck } from '../middlewares/roleCheck.js';

const router = express.Router();

router.post('/', optionalAuth, submitFeedback);

router.get('/', protect, listFeedback);

router.patch('/:id/status', protect, roleCheck('organizer'), resolveFeedback);

export default router;