import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import productoRoutes from './routes/producto.routes'; // <-- NUEVA IMPORTACIÓN

const app = express();

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
app.use('/productos', productoRoutes); // <-- CONEXIÓN DE RUTAS DE PRODUCTOS

export default app;