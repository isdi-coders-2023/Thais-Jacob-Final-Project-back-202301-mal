import express from 'express';
import upload from '../../database/multer.js';
import {
  createTourController,
  getTourByIdController,
  getToursController,
} from './tour-controllers.js';

const router = express.Router();

router.route('/').get(getToursController);
router.route('/:_id').get(getTourByIdController);
router.route('/create').post(upload.single('image'), createTourController);

export default router;
