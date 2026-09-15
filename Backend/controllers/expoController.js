import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import Expo from '../models/Expo.js';
import Booth from '../models/Booth.js';
import { generateBoothsForExpo } from './boothController.js';

function saveBase64Image(base64Str) {
  if (!base64Str || typeof base64Str !== 'string' || !base64Str.startsWith('data:image/')) {
    return base64Str || '';
  }
  try {
    const uploadDir = path.join(process.cwd(), 'uploads', 'expos');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    const matches = base64Str.match(/^data:image\/([a-zA-Z0-9-+.]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return base64Str;
    }
    const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
    const buffer = Buffer.from(matches[2], 'base64');
    const filename = `expo-${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext}`;
    const filePath = path.join(uploadDir, filename);
    fs.writeFileSync(filePath, buffer);
    return `/uploads/expos/${filename}`;
  } catch (e) {
    console.error('Failed to save base64 image:', e);
    return base64Str;
  }
}

export const createExpo = async (req, res) => {
  try {
    const { title, theme, description, date, location, floor_plan_image_url, banner_image, status, category, pass_price, total_booths } = req.body;

    let finalBannerImage = banner_image || '';
    if (req.file) {
      finalBannerImage = `/uploads/expos/${req.file.filename}`;
    } else if (finalBannerImage.startsWith('data:image/')) {
      finalBannerImage = saveBase64Image(finalBannerImage);
    }

    if (!title || !date || !location || !category) {
      return res.status(400).json({ message: 'Title, date, location, and category are required fields' });
    }

    const targetDate = new Date(date);
    const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
    const endOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 23, 59, 59, 999);

    const existingExpo = await Expo.findOne({
      location,
      date: { $gte: startOfDay, $lte: endOfDay }
    });

    if (existingExpo) {
      return res.status(400).json({
        message: `The hall "${location}" is already booked for another exhibition on ${targetDate.toLocaleDateString()}. Please choose another hall or date.`
      });
    }

    const boothCountToCreate = total_booths !== undefined ? Number(total_booths) : 24;

    const expo = await Expo.create({
      title,
      theme: theme || '',
      description: description || '',
      date,
      location,
      floor_plan_image_url: floor_plan_image_url || '/blueprint-floorplan.jpg',
      banner_image: finalBannerImage,
      category,
      pass_price: pass_price !== undefined ? Number(pass_price) : 49,
      total_booths: boothCountToCreate,
      organizer_id: req.user.user_id,
      status: status || 'upcoming',
    });

    try {
      const initialBooths = generateBoothsForExpo(expo._id, boothCountToCreate);
      await Booth.insertMany(initialBooths);
    } catch (boothErr) {
      console.error('Error pre-generating booths for expo:', boothErr);
    }

    res.status(201).json({
      message: 'Expo created successfully',
      expo,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const uploadExpoBanner = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }
    const url = `/uploads/expos/${req.file.filename}`;
    res.status(200).json({ message: 'Image uploaded successfully', url });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const listExpos = async (req, res) => {
  try {
    const { date, theme, location, status } = req.query;
    let query = {};

    if (date) {
      const searchDate = new Date(date);
      const nextDay = new Date(searchDate);
      nextDay.setDate(nextDay.getDate() + 1);

      query.date = {
        $gte: searchDate,
        $lt: nextDay,
      };
    }

    if (theme) {
      query.theme = { $regex: theme, $options: 'i' };
    }

    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    if (status) {
      query.status = status;
    }

    const expos = await Expo.find(query)
      .populate('organizer_id', 'name email phone profile_photo_url')
      .sort({ date: 1 });

    res.status(200).json({
      count: expos.length,
      expos,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getExpoById = async (req, res) => {
  try {
    const expo = await Expo.findById(req.params.id).populate(
      'organizer_id',
      'name email phone profile_photo_url'
    );

    if (!expo) {
      return res.status(404).json({ message: 'Expo not found' });
    }

    res.status(200).json({ expo });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



export const updateExpo = async (req, res) => {
  try {
    let expo = null;
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      expo = await Expo.findById(req.params.id);
    }

    const updateData = { ...req.body };
    if (req.file) {
      updateData.banner_image = `/uploads/expos/${req.file.filename}`;
    } else if (updateData.banner_image && updateData.banner_image.startsWith('data:image/')) {
      updateData.banner_image = saveBase64Image(updateData.banner_image);
    }

    if (!expo) {
      const newExpo = await Expo.create({
        ...updateData,
        organizer_id: req.user.user_id,
      });
      return res.status(200).json({
        message: 'Expo created',
        expo: newExpo,
      });
    }

    const isOrganizer = req.user.role === 'organizer';
    const isOwner = expo.organizer_id && (
      expo.organizer_id.toString() === req.user.user_id ||
      (expo.organizer_id._id && expo.organizer_id._id.toString() === req.user.user_id)
    );

    if (!isOwner && !isOrganizer) {
      return res.status(403).json({ message: 'Not authorized to update this Expo' });
    }

    const targetLocation = updateData.location || expo.location;
    const targetDateRaw = updateData.date || expo.date;

    if (targetLocation && targetDateRaw) {
      const targetDate = new Date(targetDateRaw);
      const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
      const endOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 23, 59, 59, 999);

      const conflict = await Expo.findOne({
        _id: { $ne: expo._id },
        location: targetLocation,
        date: { $gte: startOfDay, $lte: endOfDay }
      });

      if (conflict) {
        return res.status(400).json({
          message: `The hall "${targetLocation}" is already booked for another exhibition on ${targetDate.toLocaleDateString()}.`
        });
      }
    }

    const updatedExpo = await Expo.findByIdAndUpdate(
      expo._id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      message: 'Expo updated successfully',
      expo: updatedExpo,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteExpo = async (req, res) => {
  try {
    const expo = await Expo.findById(req.params.id);

    if (!expo) {
      return res.status(404).json({ message: 'Expo not found' });
    }

    if (expo.organizer_id.toString() !== req.user.user_id) {
      return res.status(403).json({ message: 'Not authorized to delete this Expo' });
    }

    await Expo.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: 'Expo deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};