import mongoose from 'mongoose';
import Expo from '../models/Expo.js';
import Booth from '../models/Booth.js';
import Registration from '../models/Registration.js';
import Bookmark from '../models/Bookmark.js';
import Session from '../models/Session.js';

// GET /api/expos/:expoId/analytics
export const getExpoAnalytics = async (req, res) => {
  try {
    const { expoId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(expoId)) {
      return res.status(400).json({ message: 'Invalid Expo ID format' });
    }

    const expoObjectId = new mongoose.Types.ObjectId(expoId);

    // Verify Expo existence and authorization
    const expo = await Expo.findById(expoObjectId);
    if (!expo) {
      return res.status(404).json({ message: 'Expo not found' });
    }

    if (expo.organizer_id.toString() !== req.user.user_id) {
      return res.status(403).json({ message: 'Not authorized to view analytics for this Expo' });
    }

    // 1. Booth Traffic & Occupancy Metrics
    const boothMetrics = await Booth.aggregate([
      { $match: { expo_id: expoObjectId } },
      {
        $group: {
          _id: null,
          total_booths: { $sum: 1 },
          booked_booths: {
            $sum: { $cond: [{ $eq: ['$status', 'booked'] }, 1, 0] },
          },
          available_booths: {
            $sum: { $cond: [{ $eq: ['$status', 'available'] }, 1, 0] },
          },
          reserved_booths: {
            $sum: { $cond: [{ $eq: ['$status', 'reserved'] }, 1, 0] },
          },
        },
      },
    ]);

    // 2. Attendee Engagement Metrics
    const totalExpoRegistrations = await Registration.countDocuments({
      expo_id: expoObjectId,
      session_id: null,
    });

    const totalSessionRegistrations = await Registration.countDocuments({
      expo_id: expoObjectId,
      session_id: { $ne: null },
    });

    // 3. Session Popularity Metrics (Registrations & Bookmarks per Session)
    const sessionAnalytics = await Session.aggregate([
      { $match: { expo_id: expoObjectId } },
      {
        $lookup: {
          from: 'registrations',
          localField: '_id',
          foreignField: 'session_id',
          as: 'session_registrations',
        },
      },
      {
        $lookup: {
          from: 'bookmarks',
          localField: '_id',
          foreignField: 'session_id',
          as: 'session_bookmarks',
        },
      },
      {
        $project: {
          _id: 1,
          title: 1,
          speaker: 1,
          start_time: 1,
          registrations_count: { $size: '$session_registrations' },
          bookmarks_count: { $size: '$session_bookmarks' },
        },
      },
      { $sort: { registrations_count: -1, bookmarks_count: -1 } },
    ]);

    res.status(200).json({
      expo_id: expoId,
      expo_title: expo.title,
      booth_traffic: boothMetrics[0] || {
        total_booths: 0,
        booked_booths: 0,
        available_booths: 0,
        reserved_booths: 0,
      },
      attendee_engagement: {
        total_expo_registrations: totalExpoRegistrations,
        total_session_registrations: totalSessionRegistrations,
        total_combined_registrations: totalExpoRegistrations + totalSessionRegistrations,
      },
      session_popularity: sessionAnalytics,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};