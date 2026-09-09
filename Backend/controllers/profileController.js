import bcrypt from 'bcrypt';
import User from '../models/User.js';

export const getMyProfile = async (req, res) => {
  try {
    const userId = req.user.user_id || req.user._id;
    const user = await User.findById(userId).select('-password_hash -otp_code -otp_expires_at -reset_token -reset_token_expires_at');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateMyProfile = async (req, res) => {
  try {
    const userId = req.user ? (req.user.user_id || req.user._id) : null;
    const { name, phone, profile_photo_url, company_name, company_profile } = req.body || {};

    let user;
    if (userId) {
      user = await User.findById(userId).catch(() => null);
    }
    if (!user && req.user?.email) {
      user = await User.findOne({ email: req.user.email });
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found in database' });
    }

    if (name) user.name = name.trim();
    if (phone) user.phone = phone.trim();

    if (req.file) {
      user.profile_photo_url = `${req.protocol}://${req.get('host')}/uploads/pfp/${req.file.filename}`;
    } else if (profile_photo_url !== undefined) {
      user.profile_photo_url = profile_photo_url;
    }

    if (!user.company_profile) user.company_profile = {};

    if (company_name !== undefined) {
      user.company_profile.company_name = company_name;
    }

    if (company_profile && typeof company_profile === 'object') {
      user.company_profile = { ...user.company_profile, ...company_profile };
    }

    user.markModified('company_profile');
    await user.save();

    const updatedUser = await User.findById(user._id).select('-password_hash -otp_code -otp_expires_at -reset_token -reset_token_expires_at');

    res.status(200).json({
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    const userId = req.user.user_id || req.user._id;
    const { current_password, new_password, confirm_password } = req.body;

    if (!new_password || new_password.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long' });
    }

    if (new_password !== confirm_password) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (current_password) {
      const isMatch = await bcrypt.compare(current_password, user.password_hash);
      if (!isMatch) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }
    }

    const salt = await bcrypt.genSalt(10);
    user.password_hash = await bcrypt.hash(new_password, salt);
    await user.save();

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
