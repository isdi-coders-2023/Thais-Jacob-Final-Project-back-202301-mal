import express from 'express';
import { validate } from 'express-validation';
import upload from '../../database/multer.js';
import {
  createTourController,
  getTourByIdController,
  getToursController,
  deleteTourController,
} from './tour-controllers.js';
import tourValidation from './tour-validation.js';

const router = express.Router();

router.use(validate(tourValidation));

router.route('/').get(getToursController);
router.route('/:_id').get(getTourByIdController);
router.route('/create').post(upload.single('image'), createTourController);
router.route('/:_id').delete(deleteTourController);

export default router;
