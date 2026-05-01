import { createClient } from '@libsql/client';

const url = process.env['TURSO_DATABASE_URL'] ?? '';
const authToken = process.env['TURSO_AUTH_TOKEN'];

const db = createClient(authToken ? { url, authToken } : { url });

export default db;
