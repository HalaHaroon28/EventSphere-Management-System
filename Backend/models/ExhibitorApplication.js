import mongoose from 'mongoose';

const exhibitorApplicationSchema = new mongoose.Schema({
  expo_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Expo',
    required: true,
  },
  exhibitor_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  company_name: {
    type: String,
    required: true,
  },
  contact_email: {
    type: String,
    default: 'exhibitor@eventsphere.io',
  },
  products_services: {
    type: String,
  },
  booth_tier_requested: {
    type: String,
    enum: ['small', 'medium', 'large'],
    default: 'medium',
  },
  documents: [
    {
      type: String,
    },
  ],
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  booth_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booth',
    default: null,
  },
  booth_status: {
    type: String,
    enum: ['none', 'selected', 'confirmed'],
    default: 'none',
  },
  approval_message: {
    type: String,
    default: '',
  },
  rejection_reason: {
    type: String,
    default: '',
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('ExhibitorApplication', exhibitorApplicationSchema);