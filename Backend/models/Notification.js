import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  },
  target_role: {
    type: String,
    enum: ['organizer', 'exhibitor', 'attendee', 'all'],
    default: 'all',
  },
  title: {
    type: String,
    default: 'Notification Alert',
  },
  type: {
    type: String,
    enum: ['session_reminder', 'application_status', 'booth_update', 'message', 'registration', 'general'],
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  read: {
    type: Boolean,
    default: false,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('Notification', notificationSchema);