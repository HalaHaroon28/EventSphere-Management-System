import mongoose from 'mongoose';
import Expo from '../models/Expo.js';
import Booth from '../models/Booth.js';
import { generateBoothsForExpo } from '../controllers/boothController.js';

async function syncAllBooths() {
  await mongoose.connect('mongodb://127.0.0.1:27017/eventsphere');
  console.log('Connected to MongoDB');

  const expos = await Expo.find();
  console.log(`Found ${expos.length} expos in database`);

  for (const expo of expos) {
    const targetCount = Number(expo.total_booths) || 24;
    const existingBooths = await Booth.find({ expo_id: expo._id });
    const hasBooked = existingBooths.some(b => b.status === 'booked' || b.status === 'reserved');

    if (!hasBooked) {
      await Booth.deleteMany({ expo_id: expo._id });
      const newBooths = generateBoothsForExpo(expo._id, targetCount);
      await Booth.insertMany(newBooths);
      console.log(`✓ Generated ${newBooths.length} booths for expo "${expo.title}" (target: ${targetCount})`);
    } else {
      console.log(`Expo "${expo.title}" has booked booths, keeping existing`);
    }
  }

  console.log('Sync complete!');
  process.exit(0);
}

syncAllBooths().catch(err => {
  console.error('Error syncing booths:', err);
  process.exit(1);
});
