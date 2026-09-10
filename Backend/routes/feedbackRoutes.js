import express from 'express';
import { submitFeedback, listFeedback, resolveFeedback } from '../controllers/feedbackController.js';
import { protect, optionalAuth } from '../middlewares/auth.js';
import { roleCheck } from '../middlewares/roleCheck.js';

const router = express.Router();

// POST /api/feedback (Public / Contact Form or Authenticated)
router.post('/', optionalAuth, submitFeedback);

// GET /api/feedback
router.get('/', protect, listFeedback);

// PATCH /api/feedback/:id/status
router.patch('/:id/status', protect, roleCheck('organizer'), resolveFeedback);

export default router;