import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import apiRouter from './api/api-router.js';
import authRouter from './api/auth/auth-router.js';
import { errorHandler } from './utils/error-handler.js';
import dotenv from 'dotenv';
dotenv.config();

const app = express();

app.use(cors());
app.use(cors({ origin: ['http://localhost:4000/'] }));

app.use(express.json());

app.get('/', (req, res) => {
  res.json('Server ON');
});
app.use('/auth', authRouter);
app.use('/api/v1', apiRouter);

app.use(bodyParser.json());

app.use(errorHandler);

app.disable('x-powered-by');

export default app;
