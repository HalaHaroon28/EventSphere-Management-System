import User from '../models/User.js';

export const updateCompanyProfile = async (req, res) => {
  try {
    const userId = req.user.user_id || req.user._id;
    const { description, website, contact_email, contact_phone, address, company_name } = req.body || {};

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (!user.company_profile) {
      user.company_profile = {};
    }

    if (company_name !== undefined) user.company_profile.company_name = company_name;
    if (description !== undefined) user.company_profile.description = description;
    if (website !== undefined) user.company_profile.website = website;
    if (contact_email !== undefined) user.company_profile.contact_email = contact_email;
    if (contact_phone !== undefined) user.company_profile.contact_phone = contact_phone;
    if (address !== undefined) user.company_profile.address = address;

    if (req.file) {
      user.company_profile.logo = `uploads/companylogos/${req.file.filename}`;
    } else if (req.body.logo) {
      let logoPath = req.body.logo;
      if (typeof logoPath === 'string' && logoPath.includes('uploads/documents/')) {
        logoPath = logoPath.replace('uploads/documents/', 'uploads/companylogos/');
      }
      user.company_profile.logo = logoPath;
    }

    user.markModified('company_profile');
    await user.save();

    const updatedUser = await User.findById(user._id).select('-password_hash -otp_code -otp_expires_at -reset_token -reset_token_expires_at');

    res.status(200).json({
      message: 'Company profile updated successfully',
      user: updatedUser,
      company_profile: updatedUser.company_profile,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};