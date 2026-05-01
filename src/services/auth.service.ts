import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { StringValue } from 'ms';
import type { Row } from '@libsql/client';
import db from '../db/client';
import type { UserRecord, UserPayload } from '../types/index';
import type { LoginInput } from '../validators/auth.validator';

export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

function rowToUser(row: Row): UserRecord {
  return {
    id: String(row['id'] ?? ''),
    nombre: String(row['nombre'] ?? ''),
    email: String(row['email'] ?? ''),
    password: String(row['password'] ?? ''),
    created_at: String(row['created_at'] ?? ''),
  };
}

export async function loginUser(
  data: LoginInput,
): Promise<{ token: string; user: { id: string; nombre: string; email: string } }> {
  const result = await db.execute({
    sql: 'SELECT * FROM users WHERE email = ?',
    args: [data.email],
  });

  const rawRow = result.rows[0];
  if (rawRow === undefined) {
    throw new AppError(401, 'Credenciales inválidas');
  }

  const user = rowToUser(rawRow);
  const valid = await bcrypt.compare(data.password, user.password);
  if (!valid) {
    throw new AppError(401, 'Credenciales inválidas');
  }

  const secret = process.env['JWT_SECRET'];
  if (!secret) throw new AppError(500, 'Error de configuración del servidor');

  const payload: UserPayload = { id: user.id, email: user.email };
  const expiresIn = (process.env['JWT_EXPIRES_IN'] ?? '7d') as StringValue;
  const token = jwt.sign(payload, secret, { expiresIn });

  return {
    token,
    user: { id: user.id, nombre: user.nombre, email: user.email },
  };
}