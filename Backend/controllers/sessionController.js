import { getIO } from '../config/socket.js';
import Session from '../models/Session.js';
import Expo from '../models/Expo.js';
import Bookmark from '../models/Bookmark.js';
import Notification from '../models/Notification.js';

// @desc    Create a new session for an Expo
// @route   POST /api/expos/:expoId/sessions
// @access  Private (Organizer only)
export const createSession = async (req, res) => {
  try {
    const { expoId } = req.params;
    const { title, topic, speaker, location, start_time, end_time } = req.body;
    const currentUserId = req.user.user_id || req.user._id;

    const expo = await Expo.findById(expoId);
    if (!expo) {
      return res.status(404).json({ message: 'Expo not found' });
    }

    if (expo.organizer_id.toString() !== currentUserId.toString()) {
      return res.status(403).json({ message: 'Not authorized to add sessions to this expo' });
    }

    if (!title || !start_time || !end_time) {
      return res.status(400).json({ message: 'Title, start_time, and end_time are required' });
    }

    const session = await Session.create({
      expo_id: expoId,
      title,
      topic: topic || '',
      speaker: speaker || '',
      location: location || '',
      start_time,
      end_time,
      created_by: currentUserId,
    });

    // ⚡ SOCKET EMIT: Broadcast new session to all connected clients
    try {
      getIO().emit('session_created', {
        expo_id: expoId,
        session,
      });
    } catch (socketErr) {
      console.error('Socket emit error (session_created):', socketErr.message);
    }

    res.status(201).json({ message: 'Session created successfully', session });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    List all sessions for an Expo
// @route   GET /api/expos/:expoId/sessions
// @access  Public
export const listSessionsForExpo = async (req, res) => {
  try {
    const { expoId } = req.params;

    const sessions = await Session.find({ expo_id: expoId }).sort({ start_time: 1 });

    res.status(200).json({
      count: sessions.length,
      sessions,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a session & notify bookmarkers
// @route   PATCH /api/sessions/:id
// @access  Private (Organizer only)
export const updateSession = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user.user_id || req.user._id;

    const session = await Session.findById(id);
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    if (session.created_by.toString() !== currentUserId.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this session' });
    }

    const updatedSession = await Session.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    // 🔔 NOTIFICATION HOOK: Notify all attendees who bookmarked this session
    const bookmarks = await Bookmark.find({ session_id: id });
    if (bookmarks.length > 0) {
      const notificationDocs = bookmarks.map((bm) => ({
        user_id: bm.user_id,
        type: 'session_reminder',
        message: `Session "${updatedSession.title}" has been updated. Check the schedule for changes!`,
      }));

      const createdNotifications = await Notification.insertMany(notificationDocs);

      // ⚡ SOCKET EMIT: Emit targeted notifications to each bookmarking user's room
      try {
        const io = getIO();
        createdNotifications.forEach((notif) => {
          io.to(notif.user_id.toString()).emit('new_notification', notif);
        });
      } catch (socketErr) {
        console.error('Socket emit error (new_notification):', socketErr.message);
      }
    }

    // ⚡ SOCKET EMIT: Broadcast session update globally
    try {
      getIO().emit('session_updated', {
        expo_id: updatedSession.expo_id,
        session: updatedSession,
      });
    } catch (socketErr) {
      console.error('Socket emit error (session_updated):', socketErr.message);
    }

    res.status(200).json({ message: 'Session updated successfully', session: updatedSession });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a session
// @route   DELETE /api/sessions/:id
// @access  Private (Organizer only)
export const deleteSession = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user.user_id || req.user._id;

    const session = await Session.findById(id);
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    if (session.created_by.toString() !== currentUserId.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this session' });
    }

    const expoId = session.expo_id;
    await session.deleteOne();

    // ⚡ SOCKET EMIT: Broadcast session deletion
    try {
      getIO().emit('session_deleted', {
        expo_id: expoId,
        session_id: id,
      });
    } catch (socketErr) {
      console.error('Socket emit error (session_deleted):', socketErr.message);
    }

    res.status(200).json({ message: 'Session deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};