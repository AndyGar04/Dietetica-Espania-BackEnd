import 'dotenv/config';
import { createClient } from '@libsql/client';

const url = process.env['TURSO_DATABASE_URL'] || 'file:dietetica.db';
const authToken = process.env['TURSO_AUTH_TOKEN'];
const db = createClient(authToken ? { url, authToken } : { url });

async function main() {
  const [, , cmd, ...rest] = process.argv;
  if (cmd === 'drop-ventas') {
    await db.execute('DROP TABLE IF EXISTS venta_items');
    await db.execute('DROP TABLE IF EXISTS ventas');
    console.log('OK: ventas + venta_items dropped');
  } else if (cmd === 'schema') {
    const t = rest[0];
    const res = await db.execute({ sql: `PRAGMA table_info(${t})`, args: [] });
    console.log(JSON.stringify(res.rows, null, 2));
  } else if (cmd === 'sql') {
    const sql = rest.join(' ');
    const res = await db.execute(sql);
    console.log(JSON.stringify({ rows: res.rows, rowsAffected: res.rowsAffected }, null, 2));
  } else {
    console.log('usage: db-tool.ts drop-ventas | schema <table> | sql <query>');
  }
}
main().catch(e => { console.error(e); process.exit(1); });
