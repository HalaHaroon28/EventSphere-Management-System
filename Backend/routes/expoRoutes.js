import express from 'express';
import {
  createExpo,
  listExpos,
  getExpoById,
  updateExpo,
  deleteExpo,
  uploadExpoBanner,
} from '../controllers/expoController.js';
import { applyToExpo, listApplicationsForExpo } from '../controllers/applicationController.js';
import { protect } from '../middlewares/auth.js';
import { roleCheck } from '../middlewares/roleCheck.js';
import { uploadDocument, uploadExpoImage } from '../middlewares/uploadMiddleware.js';

const router = express.Router();

router.get('/', listExpos);
router.post('/upload-banner', protect, uploadExpoImage.single('banner_image'), uploadExpoBanner);
router.get('/:id', getExpoById);

router.post('/', protect, uploadExpoImage.single('banner_image'), createExpo);
router.patch('/:id', protect, uploadExpoImage.single('banner_image'), updateExpo);
router.put('/:id', protect, uploadExpoImage.single('banner_image'), updateExpo);
router.delete('/:id', protect, roleCheck('organizer'), deleteExpo);

// POST /api/expos/:expoId/applications
router.post(
  '/:expoId/applications',
  protect,
  roleCheck('exhibitor'),
  uploadDocument.array('documents', 5),
  applyToExpo
);

// GET /api/expos/:expoId/applications
router.get(
  '/:expoId/applications',
  protect,
  roleCheck('organizer'),
  listApplicationsForExpo
);

export default router;