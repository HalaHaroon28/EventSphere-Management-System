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

router.get(
  '/',
  protect,
  roleCheck('organizer'),
  listAllApplications
);

router.get(
  '/mine',
  protect,
  roleCheck('exhibitor'),
  listMyApplications
);

router.patch(
  '/:id/approve',
  protect,
  roleCheck('organizer'),
  approveApplication
);

router.patch(
  '/:id/reject',
  protect,
  roleCheck('organizer'),
  rejectApplication
);

router.patch(
  '/:id/select-booth',
  protect,
  roleCheck('exhibitor'),
  selectBoothForApplication
);

router.patch(
  '/:id/confirm-booth',
  protect,
  roleCheck('organizer'),
  confirmBoothAssignment
);

export default router;