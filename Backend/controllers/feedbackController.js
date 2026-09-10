import Feedback from '../models/Feedback.js';
import Expo from '../models/Expo.js';

// POST /api/feedback
export const submitFeedback = async (req, res) => {
  try {
    const {
      category,
      type,
      rating,
      comments,
      content,
      message,
      event_id,
      expo_id,
      name,
      email,
      company,
      inquiryType
    } = req.body;

    const user_id = req.user ? (req.user._id || req.user.user_id) : null;

    // Accept content from multiple possible field names
    const feedbackContent = content || comments || message;
    
    // Accept expo_id from multiple possible field names
    let targetExpoId = expo_id || event_id;

    if (!feedbackContent || feedbackContent.trim() === '') {
      return res.status(400).json({
        message: 'Feedback content cannot be empty.',
      });
    }

    if (!targetExpoId) {
      // Find the first available expo if not provided
      const defaultExpo = await Expo.findOne();
      if (defaultExpo) {
        targetExpoId = defaultExpo._id;
      } else {
        return res.status(400).json({
          message: 'expo_id is required.',
        });
      }
    }

    const determinedType = type || inquiryType || category || 'enterprise';

    const newFeedback = await Feedback.create({
      user_id: user_id || null,
      expo_id: targetExpoId,
      name: name || (req.user ? req.user.name : ''),
      email: email || (req.user ? req.user.email : ''),
      company: company || '',
      content: feedbackContent.trim(),
      type: determinedType,
      status: 'open',
    });

    const populatedFeedback = await Feedback.findById(newFeedback._id)
      .populate('user_id', 'name email role')
      .populate('expo_id', 'title location organizer_id');

    return res.status(201).json({
      message: 'Feedback submitted successfully.',
      data: populatedFeedback,
      feedback: populatedFeedback,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Error submitting feedback.',
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

    if (type) {
      filter.type = type;
    }

    // Role-based strict isolation
    if (userRole === 'organizer') {
      // Find all expos organized by this specific organizer
      const myExpos = await Expo.find({ organizer_id: userId }).select('_id');
      const myExpoIds = myExpos.map((e) => e._id);

      if (expo_id) {
        const isOwned = myExpoIds.some((id) => id.toString() === expo_id.toString());
        if (!isOwned) {
          // If organizer requested feedback for an expo they don't own, return empty
          return res.status(200).json({
            count: 0,
            feedback: [],
          });
        }
        filter.expo_id = expo_id;
      } else {
        // Only return feedback for expos organized by this user
        filter.expo_id = { $in: myExpoIds };
      }
    } else if (userRole === 'attendee' || userRole === 'exhibitor') {
      // Attendees and exhibitors only see their own submissions
      filter.user_id = userId;
      if (expo_id) {
        filter.expo_id = expo_id;
      }
    } else if (userId) {
      filter.user_id = userId;
    } else {
      return res.status(200).json({
        count: 0,
        feedback: [],
      });
    }

    const feedbackList = await Feedback.find(filter)
      .populate('user_id', 'name email role')
      .populate('expo_id', 'title location organizer_id')
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
    const userId = req.user._id || req.user.user_id;

    const targetStatus = status || 'resolved';

    const feedback = await Feedback.findById(id).populate('expo_id');

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback entry not found' });
    }

    // Ensure the organizer owns the expo to which this feedback belongs
    if (req.user.role === 'organizer' && feedback.expo_id) {
      const expoOrganizerId = feedback.expo_id.organizer_id
        ? feedback.expo_id.organizer_id.toString()
        : null;
      if (expoOrganizerId && expoOrganizerId !== userId.toString()) {
        return res.status(403).json({
          message: 'Not authorized to modify feedback for another organizer\'s expo.',
        });
      }
    }

    feedback.status = targetStatus;
    if (response !== undefined || replyText !== undefined) {
      feedback.response = response || replyText || '';
    }
    feedback.resolved_at = targetStatus === 'resolved' ? new Date() : null;
    feedback.resolved_by = targetStatus === 'resolved' ? userId : null;

    await feedback.save();

    const populatedFeedback = await Feedback.findById(feedback._id)
      .populate('user_id', 'name email role')
      .populate('expo_id', 'title location organizer_id');

    res.status(200).json({
      message: `Feedback updated to ${targetStatus}`,
      feedback: populatedFeedback,
      data: populatedFeedback,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};