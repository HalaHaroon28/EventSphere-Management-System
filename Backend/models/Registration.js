import mongoose from 'mongoose';

const registrationSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  expo_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Expo',
    required: true,
  },
  session_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session',
    default: null,
  },
  pass_tier: {
    type: String,
    default: 'Standard Attendee Pass'
  },
  ticket_number: {
    type: String,
    default: function () {
      return 'EVT-' + Math.floor(100000 + Math.random() * 900000);
    }
  },
  user_name: {
    type: String,
    default: ''
  },
  user_email: {
    type: String,
    default: ''
  },
  user_phone: {
    type: String,
    default: ''
  },
  registered_at: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('Registration', registrationSchema);