import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes.ts';

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

app.use('/auth', authRoutes);

export default app;
