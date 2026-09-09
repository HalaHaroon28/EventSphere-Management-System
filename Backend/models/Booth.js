import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  _id: { type: String },
  id: { type: String },
  name: { type: String, required: true },
  category: { type: String, default: 'General' },
  description: { type: String, default: '' },
  price: { type: Number, default: 0 },
  image_url: { type: String, default: '' }
});

const staffSchema = new mongoose.Schema({
  _id: { type: String },
  id: { type: String },
  name: { type: String, required: true },
  role: { type: String, default: '' },
  email: { type: String, default: '' }
});

const boothDetailsSchema = new mongoose.Schema({
  description: { type: String, default: '' },
  products: { type: [productSchema], default: [] },
  staff: { type: [staffSchema], default: [] }
}, { _id: false });

const boothSchema = new mongoose.Schema({
  expo_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Expo',
    required: true,
  },
  booth_number: {
    type: String,
    required: true,
  },
  position: {
    x: { type: Number, required: true },
    y: { type: Number, required: true },
  },
  size: {
    type: String,
    enum: ['small', 'medium', 'large'],
    default: 'medium',
  },
  price: {
    type: Number,
    default: 500,
  },
  booth_fee: {
    type: Number,
    default: 500,
  },
  status: {
    type: String,
    enum: ['available', 'reserved', 'booked'],
    default: 'available',
  },
  exhibitor_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  exhibitor_name: {
    type: String,
    default: null,
  },
  details: {
    type: boothDetailsSchema,
    default: () => ({ description: '', products: [], staff: [] })
  },
}, { strict: false, timestamps: true });

export default mongoose.model('Booth', boothSchema);