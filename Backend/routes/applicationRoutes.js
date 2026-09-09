import express from 'express';
import {
  approveApplication,
  confirmBoothAssignment,
  listAllApplications,
  listMyApplications,
  rejectApplication,
  selectBoothForApplication,
} from '../controllers/applicationController.js';
import { protect } from '../middlewares/auth.js';
import { roleCheck } from '../middlewares/roleCheck.js';

const router = express.Router();

// GET /api/applications (Organizer)
router.get(
  '/',
  protect,
  roleCheck('organizer'),
  listAllApplications
);

// GET /api/applications/mine (Exhibitor)
router.get(
  '/mine',
  protect,
  roleCheck('exhibitor'),
  listMyApplications
);

// PATCH /api/applications/:id/approve (Organizer accepts application)
router.patch(
  '/:id/approve',
  protect,
  roleCheck('organizer'),
  approveApplication
);

// PATCH /api/applications/:id/reject (Organizer rejects application)
router.patch(
  '/:id/reject',
  protect,
  roleCheck('organizer'),
  rejectApplication
);

// PATCH /api/applications/:id/select-booth (Exhibitor picks booth)
router.patch(
  '/:id/select-booth',
  protect,
  roleCheck('exhibitor'),
  selectBoothForApplication
);

// PATCH /api/applications/:id/confirm-booth (Organizer confirms assigned booth)
router.patch(
  '/:id/confirm-booth',
  protect,
  roleCheck('organizer'),
  confirmBoothAssignment
);

export default router;