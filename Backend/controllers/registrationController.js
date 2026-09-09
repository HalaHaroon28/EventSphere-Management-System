import Registration from '../models/Registration.js';

// POST: Register for Expo or Session (Pass Claiming)
export const registerForExpoOrSession = async (req, res) => {
  try {
    const { expo_id, session_id, pass_tier, user_name, user_email, user_phone } = req.body;
    const user_id = req.user.user_id;

    if (!expo_id) {
      return res.status(400).json({ message: 'expo_id is required' });
    }

    const existing = await Registration.findOne({
      user_id,
      expo_id,
      session_id: session_id || null,
    });

    if (existing) {
      return res.status(200).json({
        message: 'Already registered for this exhibition pass',
        registration: existing
      });
    }

    const ticket_number = 'EVT-' + Math.floor(100000 + Math.random() * 900000);

    const registration = await Registration.create({
      user_id,
      expo_id,
      session_id: session_id || null,
      pass_tier: pass_tier || 'Standard Attendee Pass',
      ticket_number,
      user_name: user_name || req.user.name,
      user_email: user_email || req.user.email,
      user_phone: user_phone || '',
      registered_at: new Date(),
    });

    res.status(201).json({ message: 'Pass registered successfully', registration });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET: List logged in user's registrations
export const listMyRegistrations = async (req, res) => {
  try {
    const user_id = req.user.user_id;

    const registrations = await Registration.find({ user_id })
      .populate('expo_id', 'title theme date location status pass_price ticket_price')
      .populate('session_id', 'title topic speaker start_time end_time')
      .sort({ registered_at: -1 });

    res.status(200).json({
      count: registrations.length,
      registrations,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET: List all registrations across the platform for Dashboard Analytics (Organizer role)
export const getAllRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find()
      .populate('user_id', 'name email role')
      .populate('expo_id', 'title theme date location status pass_price ticket_price')
      .populate('session_id', 'title topic speaker start_time end_time')
      .sort({ registered_at: -1 });

    res.status(200).json({
      count: registrations.length,
      registrations,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};