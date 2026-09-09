import mongoose from 'mongoose';

const expoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  theme: {
    type: String,
  },
  description: {
    type: String,
  },
  date: {
    type: Date,
    required: true,
  },
  location: {
    type: String,
    enum: [
      'Grand Main Hall',
      'Royal Pavilion Hall',
      'Apex Convention Center',
      'Starlight Exhibition Hall',
      'Imperial Grand Arena',
    ],
    required: true,
  },
  floor_plan_image_url: {
    type: String,
    default: '/blueprint-floorplan.jpg',
  },
  banner_image: {
    type: String,
    default: '',
  },
  category: {
    type: String,
    required: true,
  },
  total_booths: {
    type: Number,
    min: 10
  },
  organizer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed'],
    default: 'upcoming',
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('Expo', expoSchema);