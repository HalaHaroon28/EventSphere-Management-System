import express from 'express';
import {
  addBooth,
  listBoothsForExpo,
  updateBooth,
  reserveBooth, 
  updateMyBoothDetails,
  uploadBoothProductImage
} from '../controllers/boothController.js';
import { protect } from '../middlewares/auth.js';
import { roleCheck } from '../middlewares/roleCheck.js';
import { handleBoothProductUpload } from '../middlewares/boothProductUpload.js';

const router = express.Router();

router.post('/expos/:expoId/booths', protect, roleCheck('organizer'), addBooth);
router.get('/expos/:expoId/booths', listBoothsForExpo);

router.post('/upload-product-image', protect, roleCheck('exhibitor'), handleBoothProductUpload, uploadBoothProductImage);

router.patch('/booths/:id', protect, updateBooth);

// 4.3 Reserve booth
router.patch('/:id/reserve', protect, roleCheck('exhibitor'), reserveBooth);

// 4.4 Update booth details
router.patch('/:id/details', protect, roleCheck('exhibitor'), updateMyBoothDetails);
router.patch('/booths/:id/details', protect, roleCheck('exhibitor'), updateMyBoothDetails);

export default router;