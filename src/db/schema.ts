import db from './client';

export async function initSchema(): Promise<void> {
  await db.execute(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    nombre TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`);

  await db.execute(`CREATE TABLE IF NOT EXISTS proveedores (
    id TEXT PRIMARY KEY,
    nombre TEXT NOT NULL DEFAULT '',
    mail TEXT DEFAULT '',
    nroTelefono TEXT DEFAULT ''
  )`);

  await db.execute(`CREATE TABLE IF NOT EXISTS categorias (
    id TEXT PRIMARY KEY,
    nombre TEXT NOT NULL,
    activo INTEGER NOT NULL DEFAULT 1
  )`);

  await db.execute(`CREATE TABLE IF NOT EXISTS productos (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  tipo TEXT DEFAULT 'envasado',
  precioCompra REAL DEFAULT 0,
  precioVenta REAL DEFAULT 0,
  cantidad INTEGER DEFAULT 0,
  oferta INTEGER DEFAULT 0,
  categoria TEXT DEFAULT '',
  proveedorId TEXT DEFAULT '',
  fechaVencimiento TEXT DEFAULT NULL
)`);

try {
  await db.execute(`
    ALTER TABLE productos
    ADD COLUMN fechaVencimiento TEXT DEFAULT NULL
  `);
} catch (error) {}

  await db.execute(`CREATE TABLE IF NOT EXISTS venta_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ventaId TEXT NOT NULL,
    productoId TEXT NOT NULL,
    nombre TEXT NOT NULL DEFAULT '',
    cantidad REAL NOT NULL,
    precioUnitario REAL NOT NULL DEFAULT 0,
    precioCompraUnitario REAL NOT NULL DEFAULT 0,
    descuento REAL NOT NULL DEFAULT 0,
    subtotal REAL NOT NULL DEFAULT 0,
    FOREIGN KEY (ventaId) REFERENCES ventas(id),
    FOREIGN KEY (productoId) REFERENCES productos(id)
  )`);
}
