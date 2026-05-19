import express, { Application } from 'express';
import cors from 'cors';

const app: Application = express();

app.use(express.json());
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', "PATCH"],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);


export default app;