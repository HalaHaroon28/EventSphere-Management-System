import crypto from 'crypto';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../models/User.js';
import { sendOtpEmail, sendPasswordResetEmail } from '../utils/emailService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const pfpUploadDir = path.join(__dirname, '..', 'uploads', 'pfp');

const generateToken = (user) => {
  return jwt.sign(
    {
      user_id: user._id,
      role: user.role,
      name: user.name,
      email: user.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
};

export const uploadPfpController = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file uploaded' });
    }
    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/pfp/${req.file.filename}`;
    res.status(200).json({ url: imageUrl, filename: req.file.filename });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const register = async (req, res) => {
  try {
    const { name, email, password, role, phone, profile_photo_url, profile_photo_base64 } = req.body || {};

    if (!name || !email || !password || !role || !phone) {
      return res.status(400).json({ message: 'Please fill in all required fields (name, email, password, role, phone)' });
    }

    const validRoles = ['organizer', 'exhibitor', 'attendee'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid user role specified' });
    }

    const emailExists = await User.findOne({ email: email.toLowerCase().trim() });
    if (emailExists) {
      return res.status(400).json({ message: 'An account with this email already exists' });
    }

    const phoneExists = await User.findOne({ phone: phone.trim() });
    if (phoneExists) {
      return res.status(400).json({ message: 'An account with this phone number already exists' });
    }

    let finalPfpUrl = profile_photo_url || '';
    if (req.file) {
      finalPfpUrl = `${req.protocol}://${req.get('host')}/uploads/pfp/${req.file.filename}`;
    } else if (profile_photo_base64) {
      try {
        const base64Data = profile_photo_base64.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const filename = `pfp-${uniqueSuffix}.jpg`;
        if (!fs.existsSync(pfpUploadDir)) {
          fs.mkdirSync(pfpUploadDir, { recursive: true });
        }
        fs.writeFileSync(path.join(pfpUploadDir, filename), buffer);
        finalPfpUrl = `${req.protocol}://${req.get('host')}/uploads/pfp/${filename}`;
      } catch (imgErr) {
        console.error('Failed to save base64 profile photo:', imgErr);
      }
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const otp_code = Math.floor(100000 + Math.random() * 900000).toString();
    const otp_expires_at = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes for verification

    const user = await User.create({
      name,
      email: email.toLowerCase().trim(),
      password_hash,
      role,
      phone: phone.trim(),
      profile_photo_url: finalPfpUrl,
      is_verified: false,
      otp_code,
      otp_expires_at,
      otp_enabled: true,
    });

    try {
      await sendOtpEmail(user.email, otp_code);
    } catch (mailErr) {
      console.error('Failed to send verification email on register:', mailErr);
    }

    res.status(201).json({
      otpRequired: true,
      user_id: user._id,
      role: user.role,
      message: 'Registration successful! Verification code sent to your email.',
      dev_otp_code: otp_code,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!user.is_verified) {
      const otp_code = Math.floor(100000 + Math.random() * 900000).toString();
      const otp_expires_at = new Date(Date.now() + 10 * 60 * 1000);

      user.otp_code = otp_code;
      user.otp_expires_at = otp_expires_at;
      user.otp_enabled = true;
      await user.save();

      try {
        await sendOtpEmail(user.email, otp_code);
      } catch (mailErr) {
        console.error('Failed to send verification email on login:', mailErr);
      }

      return res.status(200).json({
        otpRequired: true,
        is_verified: false,
        user_id: user._id,
        email: user.email,
        role: user.role,
        message: 'Your email is not verified yet. A 6-digit verification code has been sent to your email address.',
        dev_otp_code: otp_code,
      });
    }

    const token = generateToken(user);

    return res.status(200).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profile_photo_url: user.profile_photo_url,
        company_profile: user.company_profile,
        is_verified: true,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const resendOtp = async (req, res) => {
  try {
    const { user_id, email } = req.body || {};

    if (!user_id && !email) {
      return res.status(400).json({ message: 'Please provide user_id or email' });
    }

    let user;
    if (user_id) {
      user = await User.findById(user_id);
    } else if (email) {
      user = await User.findOne({ email: email.toLowerCase().trim() });
    }

    if (!user) {
      return res.status(404).json({ message: 'User account not found' });
    }

    if (user.is_verified) {
      return res.status(400).json({ message: 'This email is already verified. You can sign in directly.', is_verified: true });
    }

    const otp_code = Math.floor(100000 + Math.random() * 900000).toString();
    const otp_expires_at = new Date(Date.now() + 10 * 60 * 1000);

    user.otp_code = otp_code;
    user.otp_expires_at = otp_expires_at;
    user.otp_enabled = true;
    await user.save();

    await sendOtpEmail(user.email, otp_code);

    return res.status(200).json({
      message: 'New verification code sent to your email address',
      user_id: user._id,
      email: user.email,
      role: user.role,
      dev_otp_code: otp_code,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { user_id, otp_code } = req.body;

    if (!user_id || !otp_code) {
      return res.status(400).json({ message: 'Please provide user_id and otp_code' });
    }

    const user = await User.findById(user_id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.otp_code || !user.otp_expires_at) {
      return res.status(400).json({ message: 'No active verification request found. Please login or register again.' });
    }

    if (new Date() > user.otp_expires_at) {
      user.otp_code = undefined;
      user.otp_expires_at = undefined;
      await user.save();
      return res.status(400).json({ message: 'Verification code has expired. Please click Resend Email to get a new code.' });
    }

    if (user.otp_code !== otp_code.trim()) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    user.is_verified = true;
    user.otp_code = undefined;
    user.otp_expires_at = undefined;
    await user.save();

    const token = generateToken(user);

    res.status(200).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profile_photo_url: user.profile_photo_url,
        company_profile: user.company_profile,
        is_verified: true,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.user_id).select('-password_hash -otp_code -otp_expires_at -reset_token -reset_token_expires_at');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Please provide an email' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ message: 'No account found with this email' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const reset_token_expires_at = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    const resetUrl = `${clientUrl}?resetToken=${resetToken}#reset-password`;

    user.reset_token = resetToken;
    user.reset_token_expires_at = reset_token_expires_at;
    await user.save();

    await sendPasswordResetEmail(user.email, resetToken, resetUrl);

    res.status(200).json({
      message: 'Password reset token generated successfully',
      reset_token: resetToken,
      reset_url: resetUrl,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const user = await User.findOne({
      reset_token: token,
      reset_token_expires_at: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired password reset token' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password_hash = await bcrypt.hash(password, salt);
    user.reset_token = undefined;
    user.reset_token_expires_at = undefined;
    await user.save();

    res.status(200).json({ message: 'Password reset successful. You can now log in.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};