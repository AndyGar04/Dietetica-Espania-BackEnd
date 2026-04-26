import type { Request, Response } from 'express';
import { ZodError } from 'zod';
import { loginSchema } from '../validators/auth.validator';
import { loginUser, AppError } from '../services/auth.service';

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const data = loginSchema.parse(req.body);
    const result = await loginUser(data);
    res.status(200).json(result);
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ error: error.issues[0]?.message ?? 'Datos inválidos' });
      return;
    }
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}
