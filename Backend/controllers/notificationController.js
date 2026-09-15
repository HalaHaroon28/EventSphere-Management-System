import Notification from '../models/Notification.js';

export const getUserNotifications = async (req, res) => {
  try {
    const user_id = req.user.user_id || req.user._id;
    const userRole = req.user.role;
    const query = {
      $or: [
        { user_id: user_id },
        { user_id: { $in: [null, undefined] }, target_role: { $in: [userRole, 'all'] } },
      ],
    };

    const notifications = await Notification.find(query).sort({ created_at: -1 });
    const unreadCount = await Notification.countDocuments({ ...query, read: false });

    res.status(200).json({
      success: true,
      count: notifications.length,
      unreadCount,
      notifications,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const markAllAsRead = async (req, res) => {
  try {
    const user_id = req.user.user_id || req.user._id;
    const userRole = req.user.role;

    const query = {
      $or: [
        { user_id: user_id },
        { user_id: { $in: [null, undefined] }, target_role: { $in: [userRole, 'all'] } },
      ],
      read: false,
    };

    await Notification.updateMany(query, { read: true });

    res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.user_id || req.user._id;
    const userRole = req.user.role;

    const notification = await Notification.findById(id);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    const isOwner = notification.user_id && notification.user_id.toString() === user_id.toString();
    const isTargetRole = notification.target_role === userRole || notification.target_role === 'all';

    if (!isOwner && !isTargetRole) {
      return res.status(403).json({ message: 'Not authorized to access this notification' });
    }

    notification.read = true;
    await notification.save();

    res.status(200).json({ success: true, notification });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.user_id || req.user._id;
    const userRole = req.user.role;

    const notification = await Notification.findById(id);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    const isOwner = notification.user_id && notification.user_id.toString() === user_id.toString();
    const isTargetRole = notification.target_role === userRole || notification.target_role === 'all';

    if (!isOwner && !isTargetRole) {
      return res.status(403).json({ message: 'Not authorized to delete this notification' });
    }

    await notification.deleteOne();

    res.status(200).json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createNotification = async (req, res) => {
  try {
    const { user_id, target_role, title, type, message } = req.body;

    if (!type || !message) {
      return res.status(400).json({ message: 'Type and message are required' });
    }

    const notification = await Notification.create({
      user_id: user_id || req.user.user_id || req.user._id,
      target_role: target_role || 'all',
      title: title || 'Notification Alert',
      type,
      message,
    });

    res.status(201).json({ success: true, notification });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
