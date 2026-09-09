import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  receiver_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  expo_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Expo',
    default: null,
  },
  content: {
    type: String,
    required: true,
  },
  read: {
    type: Boolean,
    default: false,
  },
  sent_at: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('Message', messageSchema);