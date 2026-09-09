import express from 'express';
import { searchExhibitors, getExhibitorProfile } from '../controllers/exhibitorSearchController.js';

const router = express.Router();

router.get('/expos/:expoId/exhibitors', searchExhibitors);
router.get('/exhibitors/:id', getExhibitorProfile);

export default router;