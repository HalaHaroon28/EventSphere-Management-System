import mongoose from 'mongoose';
import ExhibitorApplication from '../models/ExhibitorApplication.js';
import Notification from '../models/Notification.js';
import Booth from '../models/Booth.js';
import User from '../models/User.js';
import Expo from '../models/Expo.js';

export const applyToExpo = async (req, res) => {
  try {
    const { expoId } = req.params;
    const { company_name, products_services, booth_tier_requested } = req.body || {};
    const userId = req.user.user_id || req.user._id;

    if (!company_name) {
      return res.status(400).json({ message: 'company_name is required.' });
    }

    const registeredUser = await User.findById(userId);
    const registeredEmail = registeredUser?.email || req.user?.email || 'exhibitor@eventsphere.io';

    const existingApp = await ExhibitorApplication.findOne({
      expo_id: expoId,
      exhibitor_id: userId,
    });
    if (existingApp) {
      return res.status(400).json({
        message: 'You have already submitted an application for this expo. You can only apply for an expo once.',
      });
    }

    const documentPaths = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        documentPaths.push(file.path.replace(/\\/g, '/'));
      });
    } else if (req.file) {
      documentPaths.push(req.file.path.replace(/\\/g, '/'));
    }

    const application = new ExhibitorApplication({
      expo_id: expoId,
      exhibitor_id: userId,
      company_name,
      contact_email: registeredEmail,
      products_services: products_services || '',
      booth_tier_requested: booth_tier_requested || 'medium',
      documents: documentPaths,
      status: 'pending',
      booth_status: 'none',
    });

    await application.save();

    try {
      await Notification.create({
        user_id: userId,
        target_role: 'exhibitor',
        title: 'Application Received',
        type: 'application_status',
        message: `Your application for "${company_name}" has been received and is currently under review.`,
      });

      const expo = await Expo.findById(expoId);
      if (expo) {
        await Notification.create({
          user_id: expo.organizer_id || null,
          target_role: 'organizer',
          title: 'New Exhibitor Application',
          type: 'application_status',
          message: `New exhibitor application received from "${company_name}" for "${expo.title || 'your expo'}".`,
        });
      }
    } catch (notifErr) {
      console.error('Failed to create submit notification:', notifErr.message);
    }

    res.status(201).json({
      message: 'Application submitted successfully',
      application,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const listMyApplications = async (req, res) => {
  try {
    const userId = req.user.user_id || req.user._id;

    const applications = await ExhibitorApplication.find({ exhibitor_id: userId })
      .populate('expo_id', 'title name status start_date end_date location')
      .populate('booth_id', 'booth_number location status size hall price')
      .sort({ created_at: -1 });

    res.status(200).json({
      count: applications.length,
      applications,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const listAllApplications = async (req, res) => {
  try {
    const applications = await ExhibitorApplication.find({})
      .populate('expo_id', 'title name status location date')
      .populate('exhibitor_id', 'name email phone company_name profile_photo_url')
      .populate('booth_id', 'booth_number status size hall price')
      .sort({ created_at: -1 });

    res.status(200).json({
      count: applications.length,
      applications,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const listApplicationsForExpo = async (req, res) => {
  try {
    const { expoId } = req.params;

    const applications = await ExhibitorApplication.find({ expo_id: expoId })
      .populate('exhibitor_id', 'name email phone company_profile profile_photo_url')
      .populate('booth_id', 'booth_number status location size hall price')
      .sort({ created_at: -1 });

    res.status(200).json({
      count: applications.length,
      applications,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const approveApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { booth_id, approval_message, reason, review_notes } = req.body || {};

    const application = await ExhibitorApplication.findById(id).populate('expo_id', 'title name');
    if (!application) {
      return res.status(404).json({ message: 'Application not found.' });
    }

    application.status = 'approved';
    const messageContent = approval_message || reason || review_notes || 'Application accepted! Please select your booth on the floor plan.';
    application.approval_message = messageContent;

    if (booth_id) {
      application.booth_id = booth_id;
      application.booth_status = 'confirmed';
      const booth = await Booth.findById(booth_id);
      if (booth) {
        booth.status = 'booked';
        booth.exhibitor_id = application.exhibitor_id;
        booth.exhibitor_name = application.company_name;
        await booth.save();
      }
    }

    if (!application.contact_email) {
      application.contact_email = application.exhibitor_id?.email || req.user?.email || 'exhibitor@eventsphere.io';
    }

    await application.save();

    const expoTitle = application.expo_id?.title || application.expo_id?.name || 'the expo';

    try {
      const notifMsg = `Your application for "${application.company_name}" at ${expoTitle} has been ACCEPTED! Note: "${messageContent}"`;
      await Notification.create({
        user_id: application.exhibitor_id,
        type: 'application_status',
        message: notifMsg,
      });
    } catch (notifErr) {
      console.error('Error creating approval notification:', notifErr);
    }

    res.status(200).json({
      message: 'Application approved successfully',
      application,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const rejectApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejection_reason, reason, rejectNotes } = req.body || {};

    const application = await ExhibitorApplication.findById(id).populate('expo_id', 'title name');
    if (!application) {
      return res.status(404).json({ message: 'Application not found.' });
    }

    application.status = 'rejected';
    const reasonContent = rejection_reason || reason || rejectNotes || 'Does not meet summit requirements.';
    application.rejection_reason = reasonContent;

    if (application.booth_id) {
      const booth = await Booth.findById(application.booth_id);
      if (booth) {
        booth.status = 'available';
        booth.exhibitor_id = null;
        booth.exhibitor_name = null;
        await booth.save();
      }
      application.booth_id = null;
      application.booth_status = 'none';
    }

    if (!application.contact_email) {
      application.contact_email = application.exhibitor_id?.email || req.user?.email || 'exhibitor@eventsphere.io';
    }

    await application.save();

    const expoTitle = application.expo_id?.title || application.expo_id?.name || 'the expo';

    try {
      const notifMsg = `Your application for "${application.company_name}" at ${expoTitle} was REJECTED. Reason: "${reasonContent}"`;
      await Notification.create({
        user_id: application.exhibitor_id,
        type: 'application_status',
        message: notifMsg,
      });
    } catch (notifErr) {
      console.error('Error creating rejection notification:', notifErr);
    }

    res.status(200).json({
      message: 'Application rejected successfully',
      application,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const selectBoothForApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { booth_id } = req.body || {};
    const userId = req.user.user_id || req.user._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid Application ID.' });
    }

    if (booth_id && !mongoose.Types.ObjectId.isValid(booth_id)) {
      return res.status(400).json({ message: 'Invalid Booth selected. Please refresh the page to choose a live floor booth.' });
    }

    const application = await ExhibitorApplication.findById(id).populate('expo_id', 'title name');
    if (!application) {
      return res.status(404).json({ message: 'Application not found.' });
    }

    if (application.exhibitor_id.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to select booth for this application.' });
    }

    if (application.status !== 'approved') {
      return res.status(400).json({ message: 'Application must be approved by organizer before selecting a booth.' });
    }

    if (!application.contact_email || application.contact_email === 'exhibitor@eventsphere.io') {
      const exhUser = await User.findById(application.exhibitor_id);
      application.contact_email = exhUser?.email || req.user?.email || 'exhibitor@eventsphere.io';
    }

    if (booth_id) {
      if (application.booth_id && application.booth_id.toString() !== booth_id) {
        const oldBooth = await Booth.findById(application.booth_id);
        if (oldBooth) {
          oldBooth.status = 'available';
          oldBooth.exhibitor_id = null;
          oldBooth.exhibitor_name = null;
          await oldBooth.save();
        }
      }

      application.booth_id = booth_id;
      application.booth_status = 'selected';
      await application.save();

      const booth = await Booth.findById(booth_id);
      if (booth) {
        booth.status = 'reserved';
        booth.exhibitor_id = userId;
        booth.exhibitor_name = application.company_name;
        await booth.save();
      }

      try {
        const expo = await Expo.findById(application.expo_id?._id || application.expo_id);
        const expoTitle = expo?.title || application.expo_id?.title || 'the expo';
        const boothNum = booth ? booth.booth_number : 'a booth';

        if (expo?.organizer_id) {
          await Notification.create({
            user_id: expo.organizer_id,
            target_role: 'organizer',
            title: 'Booth Selection Requested',
            type: 'booth_update',
            message: `Exhibitor "${application.company_name}" has selected Booth ${boothNum} for "${expoTitle}". Awaiting your review & confirmation.`,
          });
        }
      } catch (notifErr) {
        console.error('Failed to create booth selection notification:', notifErr.message);
      }
    }

    res.status(200).json({
      message: 'Booth selected successfully. Awaiting organizer final confirmation.',
      application,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const confirmBoothAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const { booth_id, action, note } = req.body || {};

    const application = await ExhibitorApplication.findById(id)
      .populate('expo_id', 'title name')
      .populate('exhibitor_id', 'name email company_name');
    if (!application) {
      return res.status(404).json({ message: 'Application not found.' });
    }

    const targetBoothId = booth_id || application.booth_id;

    if (action === 'reject' || action === 'decline') {
      if (targetBoothId) {
        const booth = await Booth.findById(targetBoothId);
        if (booth) {
          booth.status = 'available';
          booth.exhibitor_id = null;
          booth.exhibitor_name = null;
          await booth.save();
        }
      }
      application.booth_id = null;
      application.booth_status = 'none';
      if (note) application.approval_message = note;
      await application.save();

      // Send rejection notification
      try {
        const exhibitorId = application.exhibitor_id?._id || application.exhibitor_id;
        await Notification.create({
          user_id: exhibitorId,
          type: 'application_status',
          message: `Your booth selection request was declined. Reason: ${note || 'Please choose another available booth on floor plan.'}`,
        });
      } catch (nErr) {
        console.error('Failed to create notification:', nErr.message);
      }

      return res.status(200).json({
        message: 'Booth selection declined. Exhibitor can pick another booth.',
        application,
      });
    }

    let assignedBoothNumber = '';
    if (targetBoothId) {
      application.booth_id = targetBoothId;
      application.booth_status = 'confirmed';
      const booth = await Booth.findById(targetBoothId);
      if (booth) {
        booth.status = 'booked';
        booth.exhibitor_id = application.exhibitor_id?._id || application.exhibitor_id;
        booth.exhibitor_name = application.company_name || application.exhibitor_id?.name || 'Assigned Exhibitor';
        await booth.save();
        assignedBoothNumber = booth.booth_number;
      }
    }
    if (!application.contact_email) {
      application.contact_email = application.exhibitor_id?.email || req.user?.email || 'exhibitor@eventsphere.io';
    }

    if (note) application.approval_message = note;
    await application.save();

    try {
      const exhibitorId = application.exhibitor_id?._id || application.exhibitor_id;
      const expoTitle = application.expo_id?.title || application.expo_id?.name || 'the expo';
      await Notification.create({
        user_id: exhibitorId,
        type: 'application_status',
        message: `Congratulations! Your booth assignment (${assignedBoothNumber ? `Booth #${assignedBoothNumber}` : 'Floor Space'}) for ${expoTitle} has been confirmed by the organizer.`,
      });
    } catch (nErr) {
      console.error('Failed to create notification:', nErr.message);
    }

    const updatedApp = await ExhibitorApplication.findById(id)
      .populate('expo_id', 'title name status location date')
      .populate('exhibitor_id', 'name email phone company_name profile_photo_url')
      .populate('booth_id', 'booth_number status size hall price');

    res.status(200).json({
      message: 'Booth assigned and confirmed successfully.',
      application: updatedApp,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};