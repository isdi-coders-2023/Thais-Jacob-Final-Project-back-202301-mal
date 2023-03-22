import express from 'express';
import toursRouter from './tours/tour-router.js';

const router = express.Router();

router.use('/tours', toursRouter);

export default router;
