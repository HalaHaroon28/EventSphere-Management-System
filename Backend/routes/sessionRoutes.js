// server/routes/sessionRoutes.js
import express from 'express';
import {
  createSession,
  listSessionsForExpo,
  updateSession,
  deleteSession,
} from '../controllers/sessionController.js';
import { protect } from '../middlewares/auth.js';
import { roleCheck } from '../middlewares/roleCheck.js';

const router = express.Router();

router.get('/expos/:expoId/sessions', listSessionsForExpo);

router.post('/expos/:expoId/sessions', protect, roleCheck('organizer'), createSession);
router.patch('/sessions/:id', protect, roleCheck('organizer'), updateSession);
router.delete('/sessions/:id', protect, roleCheck('organizer'), deleteSession);

export default router;