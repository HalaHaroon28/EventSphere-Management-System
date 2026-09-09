
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

// GET /api/notifications - Get all user notifications
router.get('/', protect, getUserNotifications);

// POST /api/notifications - Create notification
router.post('/', protect, createNotification);

// PATCH /api/notifications/read-all - Mark all notifications as read
router.patch('/read-all', protect, markAllAsRead);

// PATCH /api/notifications/:id/read - Mark single notification as read
router.patch('/:id/read', protect, markAsRead);

// DELETE /api/notifications/:id - Delete notification
router.delete('/:id', protect, deleteNotification);

export default router;
