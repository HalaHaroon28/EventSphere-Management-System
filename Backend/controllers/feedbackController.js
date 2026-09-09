import Feedback from '../models/Feedback.js';
import Expo from '../models/Expo.js';

export const submitFeedback = async (req, res) => {
  try {
    const { category, type, rating, comments, content, message, event_id, expo_id } = req.body;
    const user_id = req.user._id || req.user.user_id;

    // Accept content from multiple possible field names
    const feedbackContent = content || comments || message;
    
    // Accept expo_id from multiple possible field names
    const targetExpoId = expo_id || event_id;

    if (!feedbackContent || feedbackContent.trim() === "") {
      return res.status(400).json({
        message: "Feedback content cannot be empty.",
      });
    }

    if (!targetExpoId) {
      return res.status(400).json({
        message: "expo_id is required.",
      });
    }

    const newFeedback = await Feedback.create({
      user_id,
      expo_id: targetExpoId,
      content: feedbackContent.trim(),
      type: type || category || "general",
      status: "open",
    });

    const populatedFeedback = await Feedback.findById(newFeedback._id)
      .populate("user_id", "name email role")
      .populate("expo_id", "title location");

    return res.status(201).json({
      message: "Feedback submitted successfully.",
      data: populatedFeedback,
      feedback: populatedFeedback,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error submitting feedback.",
      error: error.message,
    });
  }
};

// GET /api/feedback
export const listFeedback = async (req, res) => {
  try {
    const { status, expo_id, type } = req.query;
    const userId = req.user ? (req.user._id || req.user.user_id) : null;
    const userRole = req.user ? req.user.role : null;

    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (expo_id) {
      filter.expo_id = expo_id;
    }

    if (type) {
      filter.type = type;
    }

    // Filter for organizers vs other users
    if (userRole === 'organizer') {
      const myExpos = await Expo.find({ organizer_id: userId }).select('_id');
      const myExpoIds = myExpos.map(e => e._id);
      filter.$or = [
        { expo_id: { $in: myExpoIds } },
        { user_id: userId }
      ];
    } else if (userRole) {
      filter.user_id = userId;
    }

    const feedbackList = await Feedback.find(filter)
      .populate('user_id', 'name email role')
      .populate('expo_id', 'title location')
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: feedbackList.length,
      feedback: feedbackList,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PATCH /api/feedback/:id/status
export const resolveFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, response, replyText } = req.body;

    const targetStatus = status || 'resolved';

    const feedback = await Feedback.findById(id);

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback entry not found' });
    }

    feedback.status = targetStatus;
    if (response !== undefined || replyText !== undefined) {
      feedback.response = response || replyText || '';
    }
    feedback.resolved_at = targetStatus === 'resolved' ? new Date() : null;
    feedback.resolved_by = targetStatus === 'resolved' ? (req.user._id || req.user.user_id) : null;

    await feedback.save();

    const populatedFeedback = await Feedback.findById(feedback._id)
      .populate('user_id', 'name email role')
      .populate('expo_id', 'title location');

    res.status(200).json({
      message: `Feedback updated to ${targetStatus}`,
      feedback: populatedFeedback,
      data: populatedFeedback,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};