import mongoose from 'mongoose';
import Notification from '../models/Notification.js';

async function cleanMockNotifications() {
  await mongoose.connect('mongodb://127.0.0.1:27017/eventsphere');
  console.log('Connected to MongoDB');

  // Delete fake / mock notifications
  const res = await Notification.deleteMany({
    $or: [
      { title: { $in: ['Exhibitor Application Received', 'Booth Selection Pending Review', 'New Support Inquiry Logged'] } },
      { message: { $regex: 'TechCorp Solutions|NextGen AI Dynamics|Sarah Connor', $options: 'i' } }
    ]
  });

  console.log(`Deleted ${res.deletedCount} mock notifications`);

  const remaining = await Notification.find();
  console.log(`Remaining notifications in DB: ${remaining.length}`);
  for (const n of remaining) {
    console.log(`- [${n.type}] To user: ${n.user_id}, Role: ${n.target_role}, Msg: ${n.message}`);
  }

  process.exit(0);
}

cleanMockNotifications().catch(err => {
  console.error('Error cleaning notifications:', err);
  process.exit(1);
});
