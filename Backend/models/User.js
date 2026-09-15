import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password_hash: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['organizer', 'exhibitor', 'attendee'],
    required: true,
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  profile_photo_url: {
    type: String,
    default: '',
  },
  company_profile: {
    company_name: { type: String, default: '' },
    description: { type: String, default: '' },
    logo: { type: String, default: '' },
    website: { type: String, default: '' },
    contact_email: { type: String, default: '' },
    contact_phone: { type: String, default: '' },
    address: { type: String, default: '' },
  },
  is_verified: {
    type: Boolean,
    default: false,
  },
  otp_enabled: {
    type: Boolean,
    default: false,
  },
  otp_code: {
    type: String,
  },
  otp_expires_at: {
    type: Date,
  },
  reset_token: {
    type: String,
  },
  reset_token_expires_at: {
    type: Date,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
}, { strict: false });

export default mongoose.model('User', userSchema);