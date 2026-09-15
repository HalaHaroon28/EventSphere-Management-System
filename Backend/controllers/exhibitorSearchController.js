import ExhibitorApplication from '../models/ExhibitorApplication.js';
import User from '../models/User.js';

export const searchExhibitors = async (req, res) => {
  try {
    const { expoId } = req.params;
    const { keyword } = req.query;

    const filter = {
      expo_id: expoId,
      status: 'approved',
    };

    if (keyword) {
      filter.$or = [
        { company_name: { $regex: keyword, $options: 'i' } },
        { products_services: { $regex: keyword, $options: 'i' } },
      ];
    }

    const exhibitors = await ExhibitorApplication.find(filter)
      .populate('exhibitor_id', 'name email phone profile_photo_url')
      .populate('booth_id', 'booth_number position status')
      .sort({ company_name: 1 });

    res.status(200).json({
      count: exhibitors.length,
      exhibitors,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getExhibitorProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const exhibitor = await User.findOne({ _id: id, role: 'exhibitor' }).select(
      'name email phone profile_photo_url'
    );

    if (!exhibitor) {
      return res.status(404).json({ message: 'Exhibitor not found' });
    }

    const applications = await ExhibitorApplication.find({
      exhibitor_id: id,
      status: 'approved',
    })
      .populate('expo_id', 'title theme date location status')
      .populate('booth_id', 'booth_number position status');

    res.status(200).json({
      exhibitor,
      applications,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};