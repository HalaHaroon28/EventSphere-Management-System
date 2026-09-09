import express from 'express';
import {
  registerForExpoOrSession,
  listMyRegistrations,
  getAllRegistrations,
} from '../controllers/registrationController.js';
import { protect } from '../middlewares/auth.js';
import { roleCheck } from '../middlewares/roleCheck.js';

const router = express.Router();

router.post('/registrations', protect, registerForExpoOrSession);
router.get('/registrations/mine', protect, roleCheck('attendee'), listMyRegistrations);
router.get('/registrations', protect, roleCheck('organizer'), getAllRegistrations);

export default router;