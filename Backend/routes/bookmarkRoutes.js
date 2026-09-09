import express from 'express';
import {
  addBookmark,
  listMyBookmarks,
  removeBookmark,
} from '../controllers/bookmarkController.js';
import { protect } from '../middlewares/auth.js';
import { roleCheck } from '../middlewares/roleCheck.js';

const router = express.Router();

router.post('/bookmarks', protect, roleCheck('attendee'), addBookmark);
router.get('/bookmarks/mine', protect, roleCheck('attendee'), listMyBookmarks);
router.delete('/bookmarks/:id', protect, roleCheck('attendee'), removeBookmark);

export default router;