import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Token no proporcionado' });
    return;
  }

  const token = authHeader.slice(7);
  const secret = process.env['JWT_SECRET'];
  if (!secret) {
    res.status(500).json({ error: 'Error de configuración del servidor' });
    return;
  }

  try {
    const decoded = jwt.verify(token, secret);
    if (typeof decoded === 'string') {
      res.status(401).json({ error: 'Token inválido' });
      return;
    }

    const id = decoded['id'];
    const email = decoded['email'];
    if (typeof id !== 'string' || typeof email !== 'string') {
      res.status(401).json({ error: 'Token inválido' });
      return;
    }

    req.user = { id, email };
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido o expirado' });
  }
}
