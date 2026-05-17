import express, { Application } from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import productoRoutes from './routes/producto.routes';

const app: Application = express();

app.use(express.json());
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

// RUTAS
app.use('/auth', authRoutes);
app.use('/productos', productoRoutes);

export default app;