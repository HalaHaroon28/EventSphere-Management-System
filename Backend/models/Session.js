import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  expo_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Expo',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  topic: {
    type: String,
  },
  speaker: {
    type: String,
  },
  location: {
    type: String,
  },
  start_time: {
    type: Date,
    required: true,
  },
  end_time: {
    type: Date,
    required: true,
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('Session', sessionSchema);