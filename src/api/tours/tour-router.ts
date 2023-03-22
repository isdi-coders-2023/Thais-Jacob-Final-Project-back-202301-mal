import express from 'express';
import upload from '../../database/multer.js';
import {
  createTourController,
  getToursController,
} from './tour-controllers.js';

const router = express.Router();

router
  .route('/')
  .post(upload.single('image'), createTourController)
  .get(getToursController);

export default router;
