import { createClient } from '@libsql/client';
import 'dotenv/config';

const url = process.env['TURSO_DATABASE_URL'] || 'file:dietetica.db'; 
const authToken = process.env['TURSO_AUTH_TOKEN'];

if (!url) {
  throw new Error("❌ Error: TURSO_DATABASE_URL no está definida en el .env");
}

const db = createClient(authToken ? { url, authToken } : { url });

export default db;