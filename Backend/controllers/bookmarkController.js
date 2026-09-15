import Bookmark from '../models/Bookmark.js';
import Session from '../models/Session.js';
import Notification from '../models/Notification.js';
import mongoose from 'mongoose';

export const addBookmark = async (req, res) => {
  try {
    const { session_id } = req.body;
    const user_id = req.user.user_id || req.user._id;

    if (!session_id) {
      return res.status(400).json({ message: 'session_id is required' });
    }

    const existing = await Bookmark.findOne({ user_id, session_id });
    if (existing) {
      return res.status(200).json({ message: 'Session already bookmarked', bookmark: existing });
    }

    const bookmark = await Bookmark.create({
      user_id,
      session_id,
      reminder_sent: false,
    });

    const populatedBookmark = await Bookmark.findById(bookmark._id).populate(
      'session_id',
      'title topic speaker speaker_title speaker_avatar location start_time end_time expo_id capacity registered_count'
    );

    const session = await Session.findById(session_id);
    const sessionTitle = session ? session.title : 'a session';

    await Notification.create({
      user_id,
      type: 'session_reminder',
      message: `You bookmarked "${sessionTitle}". You will receive updates regarding this session.`,
    });

    res.status(201).json({ message: 'Session bookmarked', bookmark: populatedBookmark || bookmark });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const listMyBookmarks = async (req, res) => {
  try {
    const user_id = req.user.user_id || req.user._id;

    const bookmarks = await Bookmark.find({ user_id }).populate(
      'session_id',
      'title topic speaker speaker_title speaker_avatar location start_time end_time expo_id capacity registered_count'
    );

    res.status(200).json({
      count: bookmarks.length,
      bookmarks,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const removeBookmark = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.user_id || req.user._id;

    let bookmark;
    if (mongoose.isValidObjectId(id)) {
      bookmark = await Bookmark.findOne({
        user_id,
        $or: [{ _id: id }, { session_id: id }]
      });
    } else {
      bookmark = await Bookmark.findOne({ user_id, session_id: id });
    }

    if (!bookmark) {
      return res.status(404).json({ message: 'Bookmark not found' });
    }

    await bookmark.deleteOne();

    res.status(200).json({ message: 'Bookmark removed', id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};