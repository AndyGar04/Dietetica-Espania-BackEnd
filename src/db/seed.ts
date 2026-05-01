import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import db from './client';
import { initSchema } from './schema';

const SEED_EMAIL = 'admin@dietetica.com';

async function seed() {
  await initSchema();

  const existing = await db.execute({
    sql: 'SELECT id FROM users WHERE email = ?',
    args: [SEED_EMAIL],
  });

  if (existing.rows.length > 0) {
    console.log(`Usuario con email ${SEED_EMAIL} ya existe. Nada que hacer.`);
    return;
  }

  const hashedPassword = await bcrypt.hash('admin123', 10);

  await db.execute({
    sql: 'INSERT INTO users (id, nombre, email, password) VALUES (?, ?, ?, ?)',
    args: [randomUUID(), 'Admin', SEED_EMAIL, hashedPassword],
  });

  console.log(`Usuario admin creado: ${SEED_EMAIL}`);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
