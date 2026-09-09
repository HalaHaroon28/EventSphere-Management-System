import { getIO } from '../config/socket.js';
import Booth from '../models/Booth.js';
import Expo from '../models/Expo.js';
import ExhibitorApplication from '../models/ExhibitorApplication.js';

export const addBooth = async (req, res) => {
  try {
    const { expoId } = req.params;
    const { booth_number, position, size, status, price, booth_fee, exhibitor_id, exhibitor_name } = req.body;

    if (!booth_number || !position || position.x === undefined || position.y === undefined) {
      return res.status(400).json({ message: 'booth_number and position { x, y } are required' });
    }

    const expo = await Expo.findById(expoId);
    if (!expo) {
      return res.status(404).json({ message: 'Expo not found' });
    }

    if (expo.organizer_id.toString() !== req.user.user_id) {
      return res.status(403).json({ message: 'Not authorized to add booths to this Expo' });
    }

    const boothExists = await Booth.findOne({ expo_id: expoId, booth_number });
    if (boothExists) {
      return res.status(400).json({ message: `Booth ${booth_number} already exists for this Expo` });
    }

    const finalFee = Number(price || booth_fee || 500);

    const booth = await Booth.create({
      expo_id: expoId,
      booth_number,
      position,
      size: size || 'medium',
      price: finalFee,
      booth_fee: finalFee,
      status: status || (exhibitor_id ? 'booked' : 'available'),
      exhibitor_id: exhibitor_id || null,
      exhibitor_name: exhibitor_name || null,
    });

    res.status(201).json({
      message: 'Booth added successfully',
      booth,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export function generateBoothsForExpo(expoId, totalCount = 24) {
  const booths = [];
  const halls = ['A', 'B', 'C', 'D'];
  const count = Math.max(Number(totalCount) || 24, 1);
  
  // Distribute across 3 or 4 hall rows
  const numHalls = count <= 12 ? 3 : (count <= 24 ? 3 : 4);
  const boothsPerHall = Math.ceil(count / numHalls);
  
  let createdCount = 0;

  for (let h = 0; h < numHalls && createdCount < count; h++) {
    const hallLetter = halls[h] || `H${h + 1}`;
    const yPos = numHalls === 3 
      ? (h === 0 ? 25 : h === 1 ? 52 : 78)
      : Math.round(18 + h * 23);

    const remaining = count - createdCount;
    const thisHallCount = Math.min(boothsPerHall, remaining);
    
    for (let b = 1; b <= thisHallCount; b++) {
      createdCount++;
      const booth_number = `${hallLetter}-${String(b).padStart(2, '0')}`;
      
      // Calculate x position evenly across canvas (14% to 86%)
      const xSpacing = thisHallCount > 1 ? 72 / (thisHallCount - 1) : 0;
      const xPos = thisHallCount === 1 ? 50 : Math.round(14 + (b - 1) * xSpacing);
      
      // Tiered sizing & pricing
      let size = 'medium';
      let price = 2200;
      if (b === 1 || b === thisHallCount) {
        size = 'large';
        price = 3500;
      } else if (b % 3 === 0) {
        size = 'small';
        price = 1200;
      }

      booths.push({
        expo_id: expoId,
        booth_number,
        position: { x: xPos, y: yPos },
        size,
        price,
        booth_fee: price,
        status: 'available',
        exhibitor_id: null,
        exhibitor_name: null,
      });
    }
  }

  return booths;
}

export const listBoothsForExpo = async (req, res) => {
  try {
    const { expoId } = req.params;

    const expo = await Expo.findById(expoId);
    if (!expo) {
      return res.status(404).json({ message: 'Expo not found' });
    }

    let booths = await Booth.find({ expo_id: expoId })
      .populate('exhibitor_id', 'name email phone profile_photo_url company_name company_profile')
      .sort({ booth_number: 1 });

    const targetTotal = Number(expo.total_booths) || 24;

    if (booths.length === 0) {
      const defaultBoothsData = generateBoothsForExpo(expoId, targetTotal);
      await Booth.insertMany(defaultBoothsData);

      booths = await Booth.find({ expo_id: expoId })
        .populate('exhibitor_id', 'name email phone profile_photo_url company_name')
        .sort({ booth_number: 1 });
    } else if (booths.length < targetTotal) {
      // If the expo had fewer booths than configured total_booths, top up missing booths
      const existingNumbers = new Set(booths.map((b) => b.booth_number));
      const fullSet = generateBoothsForExpo(expoId, targetTotal);
      const missingBooths = fullSet.filter((b) => !existingNumbers.has(b.booth_number));
      if (missingBooths.length > 0) {
        await Booth.insertMany(missingBooths);
        booths = await Booth.find({ expo_id: expoId })
          .populate('exhibitor_id', 'name email phone profile_photo_url company_name')
          .sort({ booth_number: 1 });
      }
    }

    res.status(200).json({
      count: booths.length,
      booths,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateBooth = async (req, res) => {
  try {
    const { id } = req.params;
    const { booth_number, position, size, status, price, booth_fee, exhibitor_id, exhibitor_name, details } = req.body;

    const booth = await Booth.findById(id).populate('expo_id');
    if (!booth) {
      return res.status(404).json({ message: 'Booth not found' });
    }

    const isOrganizer = booth.expo_id.organizer_id.toString() === req.user.user_id;
    const isAssignedExhibitor = booth.exhibitor_id && booth.exhibitor_id.toString() === req.user.user_id;

    if (!isOrganizer && !isAssignedExhibitor) {
      return res.status(403).json({ message: 'Not authorized to update this booth' });
    }

    if (!isOrganizer && isAssignedExhibitor) {
      if (details) {
        booth.details = { ...booth.details, ...details };
      }
      await booth.save();
      return res.status(200).json({ message: 'Booth details updated successfully', booth });
    }

    if (booth_number) booth.booth_number = booth_number;
    if (position) booth.position = position;
    if (size) booth.size = size;
    if (status) booth.status = status;
    if (price !== undefined || booth_fee !== undefined) {
      const finalFee = Number(price || booth_fee || 500);
      booth.price = finalFee;
      booth.booth_fee = finalFee;
    }
    if (exhibitor_id !== undefined) booth.exhibitor_id = exhibitor_id || null;
    if (exhibitor_name !== undefined) booth.exhibitor_name = exhibitor_name || null;
    if (details) booth.details = { ...booth.details, ...details };

    await booth.save();

    res.status(200).json({
      message: 'Booth updated successfully',
      booth,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const reserveBooth = async (req, res) => {
  try {
    const { id: boothId } = req.params;
    const userId = req.user.user_id || req.user._id;

    // 1. Find booth
    const booth = await Booth.findById(boothId);
    if (!booth) {
      return res.status(404).json({ message: 'Booth not found.' });
    }

    // 2. Check if booth is available
    if (booth.status === 'booked' || booth.status === 'reserved') {
      return res.status(400).json({ message: 'Booth is already booked or reserved.' });
    }

    // 3. Check for an approved application for this expo by this exhibitor
    const approvedApplication = await ExhibitorApplication.findOne({
      expo_id: booth.expo_id,
      exhibitor_id: userId,
      status: 'approved',
    });

    if (!approvedApplication) {
      return res.status(403).json({
        message: 'Reservation failed. You must have an approved application for this expo to reserve a booth.',
      });
    }

    // 4. Reserve booth and update both records
    booth.status = 'booked';
    booth.exhibitor_id = userId;
    await booth.save();

    approvedApplication.booth_id = booth._id;
    await approvedApplication.save();

    res.status(200).json({
      message: 'Booth reserved successfully',
      booth,
      application: approvedApplication,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const uploadBoothProductImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file uploaded' });
    }
    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/boothproducts/${req.file.filename}`;
    res.status(200).json({ url: imageUrl, filename: req.file.filename });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateMyBoothDetails = async (req, res) => {
  try {
    const { id: boothId } = req.params;
    const userId = req.user.user_id || req.user._id;
    const { description, products, staff } = req.body || {};

    const booth = await Booth.findById(boothId);
    if (!booth) {
      return res.status(404).json({ message: 'Booth not found.' });
    }

    // Ownership Verification: Ensure only assigned exhibitor can edit
    const boothExhId = typeof booth.exhibitor_id === 'object' && booth.exhibitor_id !== null
      ? (booth.exhibitor_id._id ? booth.exhibitor_id._id.toString() : booth.exhibitor_id.toString())
      : String(booth.exhibitor_id || '');

    const currentUserId = String(userId || '');

    if (!boothExhId || boothExhId !== currentUserId) {
      return res.status(403).json({ message: 'Access denied. You are not assigned to this booth.' });
    }

    // Automatically ensure booth status is booked if assigned to exhibitor
    if (booth.status === 'available') {
      booth.status = 'booked';
      await booth.save();
    }

    // Product & Staff Validation Rules
    if (products !== undefined && Array.isArray(products)) {
      if (products.length < 1) {
        return res.status(400).json({ message: 'At least 1 product is required (min 1, max 3).' });
      }
      if (products.length > 3) {
        return res.status(400).json({ message: 'Maximum 3 products allowed.' });
      }
    }

    if (staff !== undefined && Array.isArray(staff)) {
      if (staff.length < 1) {
        return res.status(400).json({ message: 'At least 1 staff attendant is required (min 1, max 3).' });
      }
      if (staff.length > 3) {
        return res.status(400).json({ message: 'Maximum 3 staff attendants allowed.' });
      }
    }

    const newDetails = {
      description: description !== undefined ? description : booth.details?.description || '',
      products: products !== undefined ? products : booth.details?.products || [],
      staff: staff !== undefined ? staff : booth.details?.staff || [],
    };

    const updatedBooth = await Booth.findByIdAndUpdate(
      boothId,
      { $set: { details: newDetails } },
      { new: true, runValidators: false }
    ).populate('exhibitor_id', 'name email phone profile_photo_url company_name company_profile');

    res.status(200).json({
      message: 'Booth profile and details updated successfully',
      booth: updatedBooth,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};