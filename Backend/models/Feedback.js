import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema(
  {
    expo_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Expo',
      required: true,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['complaint', 'suggestion', 'general', 'issue'],
      default: 'general',
    },
    content: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'open', 'resolved'],
      default: 'open',
    },
    response: {
      type: String,
      default: '',
    },
    resolved_at: {
      type: Date,
      default: null,
    },
    resolved_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Feedback', feedbackSchema);