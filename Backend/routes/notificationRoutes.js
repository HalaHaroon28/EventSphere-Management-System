
import express from 'express';
import {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createNotification,
} from '../controllers/notificationController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

router.get('/', protect, getUserNotifications);

router.post('/', protect, createNotification);

router.patch('/read-all', protect, markAllAsRead);

router.patch('/:id/read', protect, markAsRead);

router.delete('/:id', protect, deleteNotification);

export default router;
