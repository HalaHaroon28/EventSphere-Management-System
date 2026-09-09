import mongoose from 'mongoose';

const bookmarkSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  session_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session',
    required: true,
  },
  reminder_sent: {
    type: Boolean,
    default: false,
  },
});

export default mongoose.model('Bookmark', bookmarkSchema);