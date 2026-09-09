import express from 'express';
import {
  register,
  login,
  verifyOtp,
  resendOtp,
  getMe,
  forgotPassword,
  resetPassword,
  uploadPfpController,
} from '../controllers/authController.js';
import { protect } from '../middlewares/auth.js';
import { handlePfpUpload } from '../middlewares/pfpUpload.js';

const router = express.Router();

router.post('/register', handlePfpUpload, register);
router.post('/upload-pfp', handlePfpUpload, uploadPfpController);
router.post('/login', login);
router.post('/verify-otp', verifyOtp);
router.post('/resend-otp', resendOtp);
router.get('/me', protect, getMe);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

export default router;