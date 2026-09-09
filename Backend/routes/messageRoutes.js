import express from "express";
import {
  sendMessage,
  listInbox,
  getThreadWithUser,
  deleteThreadWithUser,
  getUsersForMessaging,
} from "../controllers/messageController.js";
import { protect } from "../middlewares/auth.js";

const router = express.Router();

router.post("/", protect, sendMessage);
router.get("/inbox", protect, listInbox);
router.get("/contacts", protect, getUsersForMessaging);
router.get("/thread/:userId", protect, getThreadWithUser);
router.delete("/thread/:userId", protect, deleteThreadWithUser);

export default router;