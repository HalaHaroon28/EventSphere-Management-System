import express from 'express';
import { getMyProfile, updateMyProfile, changePassword } from '../controllers/profileController.js';
import { protect } from '../middlewares/auth.js';
import { roleCheck } from '../middlewares/roleCheck.js';
import { handlePfpUpload } from '../middlewares/pfpUpload.js';
import { handleCompanyLogoUpload } from '../middlewares/companyLogoUpload.js';
import { updateCompanyProfile } from '../controllers/exhibitorController.js';

const router = express.Router();

router.get('/me', protect, getMyProfile);
router.patch('/me', protect, handlePfpUpload, updateMyProfile);
router.patch('/change-password', protect, changePassword);
router.patch(
  '/company',
  protect,
  handleCompanyLogoUpload,
  updateCompanyProfile
);

export default router;
