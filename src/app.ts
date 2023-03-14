import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import authRouter from './api/auth/auth-router.js';
import errorHandler from './utils/error-handler.js';
import apiRouter from './api/api-router.js';

const app = express();

app.disable('x-powered-by');

app.use(cors());

app.use(cors({ origin: ['http://localhost:4000/'] }));

app.get('/', (req, res) => {
  res.json('Server ON');
});

app.use(express.json());

app.use('/auth', authRouter);
app.use('/api/v1', apiRouter);

app.use(bodyParser.json());

app.use(errorHandler);

export default app;
