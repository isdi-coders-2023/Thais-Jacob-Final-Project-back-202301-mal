import express from 'express';
import apiRouter from './api/api-router.js';
import cors from 'cors';

const app = express();

app.get('/', (_req, res) => {
  res.json('Server ON');
});

app.use(cors());
app.use(express.json());
app.use(cors({ origin: ['http://localhost:4000/'] }));
app.use('/api/v1', apiRouter);

app.disable('x-powered-by');

export default app;
