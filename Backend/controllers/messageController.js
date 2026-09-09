import Message from "../models/Message.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";

/**
 * Send a message to another user
 * @route POST /api/messages
 * @access Protected (All Authenticated Roles)
 */
export const sendMessage = async (req, res) => {
  try {
    const { receiver_id, content } = req.body;
    const sender_id = req.user._id || req.user.user_id;

    if (!receiver_id || !content || content.trim() === "") {
      return res.status(400).json({
        message: "Receiver ID and message content are required.",
      });
    }

    if (sender_id.toString() === receiver_id.toString()) {
      return res.status(400).json({
        message: "You cannot send a message to yourself.",
      });
    }

    // Role Restrictions:
    // 1. Organizers can ONLY communicate with exhibitors.
    // 2. Exhibitors can communicate with fellow exhibitors and organizers.
    // 3. Attendees are excluded from direct messaging.
    const sender = await User.findById(sender_id);
    const receiver = await User.findById(receiver_id);

    if (!receiver) {
      return res.status(404).json({ message: "Recipient user not found." });
    }

    if (sender) {
      const activeRole = req.headers['x-current-role'] || sender.role;
      if (activeRole === "organizer" && receiver.role !== "exhibitor") {
        return res.status(403).json({
          message: "Organizers can only communicate with exhibitors.",
        });
      }
      if (activeRole === "attendee" && receiver.role !== "exhibitor") {
        return res.status(403).json({
          message: "Attendees can only communicate with exhibitors.",
        });
      }
      // Exhibitors can communicate with organizers, fellow exhibitors, and attendees.
    }

    const newMessage = await Message.create({
      sender_id,
      receiver_id,
      content: content.trim(),
    });

    // Create a new message notification for recipient so it appears on login/drawer
    const senderName = sender ? sender.name : "A user";
    const senderCompany = sender?.company_profile?.company_name ? ` (${sender.company_profile.company_name})` : "";
    const previewMsg = content.trim().length > 60 ? content.trim().slice(0, 57) + "..." : content.trim();

    try {
      await Notification.create({
        user_id: receiver_id,
        target_role: receiver.role || 'exhibitor',
        title: 'New Message Received',
        type: 'message',
        message: `New message from ${senderName}${senderCompany}: "${previewMsg}"`,
        read: false,
      });
    } catch (notifErr) {
      console.error("Failed to create message notification:", notifErr.message);
    }

    const populatedMessage = await Message.findById(newMessage._id)
      .populate("sender_id", "name email role profile_photo_url company_profile")
      .populate("receiver_id", "name email role profile_photo_url company_profile");

    return res.status(201).json({
      message: "Message sent successfully",
      data: populatedMessage,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error sending message",
      error: error.message,
    });
  }
};

/**
 * Get user inbox (latest messages received or sent, grouped by conversation partner)
 * @route GET /api/messages/inbox
 * @access Protected (All Authenticated Roles)
 */
export const listInbox = async (req, res) => {
  try {
    const userId = req.user._id || req.user.user_id;
    const userRole = req.headers['x-current-role'] || req.user.role;

    // Find all messages involving the current user
    const messages = await Message.find({
      $or: [{ sender_id: userId }, { receiver_id: userId }],
    })
      .sort({ sent_at: -1, createdAt: -1 })
      .populate("sender_id", "name email role profile_photo_url company_profile")
      .populate("receiver_id", "name email role profile_photo_url company_profile");

    const conversationsMap = new Map();

    messages.forEach((msg) => {
      if (!msg.sender_id || !msg.receiver_id) return;

      const senderIdStr = msg.sender_id._id
        ? msg.sender_id._id.toString()
        : msg.sender_id.toString();

      const isSender = senderIdStr === userId.toString();
      const partner = isSender ? msg.receiver_id : msg.sender_id;

      if (!partner || !partner._id) return;

      // Role Restrictions filtering:
      if (userRole === "organizer" && partner.role !== "exhibitor") {
        return;
      }
      if (userRole === "attendee" && partner.role !== "exhibitor") {
        return;
      }
      // Exhibitors see all partner roles

      const partnerId = partner._id.toString();

      if (!conversationsMap.has(partnerId)) {
        conversationsMap.set(partnerId, {
          contact: partner,
          last_message: {
            _id: msg._id,
            content: msg.content,
            sender_id: senderIdStr,
            read: msg.read,
            sent_at: msg.sent_at || msg.createdAt,
          },
        });
      }
    });

    const inbox = Array.from(conversationsMap.values());

    return res.status(200).json({
      count: inbox.length,
      inbox,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching inbox",
      error: error.message,
    });
  }
};

/**
 * Get full conversation thread with a specific user
 * @route GET /api/messages/thread/:userId
 * @access Protected (All Authenticated Roles)
 */
export const getThreadWithUser = async (req, res) => {
  try {
    const currentUserId = req.user._id || req.user.user_id;
    const { userId: partnerId } = req.params;

    if (!partnerId) {
      return res.status(400).json({ message: "Partner user ID is required." });
    }

    const thread = await Message.find({
      $or: [
        { sender_id: currentUserId, receiver_id: partnerId },
        { sender_id: partnerId, receiver_id: currentUserId },
      ],
    })
      .sort({ sent_at: 1, createdAt: 1 })
      .populate("sender_id", "name email role profile_photo_url company_profile")
      .populate("receiver_id", "name email role profile_photo_url company_profile");

    const validThread = thread.filter(
      (msg) => msg.sender_id && msg.receiver_id
    );

    // Mark unread messages received by current user in this thread as read
    await Message.updateMany(
      { sender_id: partnerId, receiver_id: currentUserId, read: false },
      { $set: { read: true } }
    );

    return res.status(200).json({
      count: validThread.length,
      thread: validThread,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching message thread",
      error: error.message,
    });
  }
};

/**
 * Delete a whole conversation thread between current user and partner
 * @route DELETE /api/messages/thread/:userId
 * @access Protected
 */
export const deleteThreadWithUser = async (req, res) => {
  try {
    const currentUserId = req.user._id || req.user.user_id;
    const { userId: partnerId } = req.params;

    if (!partnerId) {
      return res.status(400).json({ message: "Partner user ID is required." });
    }

    const result = await Message.deleteMany({
      $or: [
        { sender_id: currentUserId, receiver_id: partnerId },
        { sender_id: partnerId, receiver_id: currentUserId },
      ],
    });

    return res.status(200).json({
      message: "Conversation thread deleted successfully",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error deleting message thread",
      error: error.message,
    });
  }
};

/**
 * Get contacts list for initiating new conversations
 * @route GET /api/messages/contacts
 * @access Protected
 */
export const getUsersForMessaging = async (req, res) => {
  try {
    const currentUserId = req.user._id || req.user.user_id;
    const currentUserRole = req.headers['x-current-role'] || req.user.role;

    let query = { _id: { $ne: currentUserId } };

    if (currentUserRole === "organizer") {
      // Organizers can ONLY contact exhibitors
      query.role = "exhibitor";
    } else if (currentUserRole === "attendee") {
      // Attendees can ONLY contact exhibitors
      query.role = "exhibitor";
    } else if (currentUserRole === "exhibitor") {
      // Exhibitors can contact exhibitors, organizers, and attendees
      query.role = { $in: ["organizer", "exhibitor", "attendee"] };
    } else {
      query.role = { $in: ["organizer", "exhibitor", "attendee"] };
    }

    const contacts = await User.find(query)
      .select("name email role profile_photo_url company_profile phone")
      .sort({ name: 1 });

    return res.status(200).json({
      count: contacts.length,
      contacts,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching messaging contacts",
      error: error.message,
    });
  }
};