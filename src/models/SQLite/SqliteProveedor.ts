import Database from "better-sqlite3";
import { Proveedor } from "../proveedor";

export class SqliteProveedorRepository {
  private db: Database.Database;

  constructor(dbPath: string) {
    this.db = new Database(dbPath);
    this.init();
  }

  private init(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS proveedores (
        id TEXT PRIMARY KEY,
        nombre TEXT NOT NULL DEFAULT '',
        mail TEXT DEFAULT '',
        nroTelefono TEXT DEFAULT ''
      );
    `);

    const columnas = ["nombre TEXT DEFAULT ''", "mail TEXT DEFAULT ''", "nroTelefono TEXT DEFAULT ''"];
    columnas.forEach((col) => {
      try { this.db.exec(`ALTER TABLE proveedores ADD COLUMN ${col};`); } catch {}
    });
  }

  public async save(p: any): Promise<void> {
    const stmt = this.db.prepare(`
      INSERT INTO proveedores (id, nombre, mail, nroTelefono)
      VALUES (?, ?, ?, ?)
    `);

    const id = typeof p.getId === "function" ? p.getId() : p.id;
    const nombre = typeof p.getNombre === "function" ? p.getNombre() : (p.nombre || p.razonSocial || "");
    const mail = typeof p.getMail === "function" ? p.getMail() : (p.mail || "");
    const nroTelefono = typeof p.getNroTelefono === "function" ? p.getNroTelefono() : (p.nroTelefono || "");

    stmt.run(id, nombre, mail, nroTelefono);
  }

  public async findById(id: string): Promise<Proveedor | null> {
    const stmt = this.db.prepare(`SELECT * FROM proveedores WHERE id = ?`);
    const row: any = stmt.get(id);
    if (!row) return null;
    return new Proveedor(row.id, row.nombre || row.razonSocial || "", row.mail || "", row.nroTelefono || "");
  }

  public async findAll(): Promise<Proveedor[]> {
    const stmt = this.db.prepare(`SELECT * FROM proveedores`);
    const rows: any[] = stmt.all();
    return rows.map(row => new Proveedor(row.id, row.nombre || row.razonSocial || "", row.mail || "", row.nroTelefono || ""));
  }

  public async update(p: any): Promise<void> {
    const stmt = this.db.prepare(`
      UPDATE proveedores SET nombre = ?, mail = ?, nroTelefono = ? WHERE id = ?
    `);

    const id = typeof p.getId === "function" ? p.getId() : p.id;
    const nombre = typeof p.getNombre === "function" ? p.getNombre() : (p.nombre || p.razonSocial || "");
    const mail = typeof p.getMail === "function" ? p.getMail() : (p.mail || "");
    const nroTelefono = typeof p.getNroTelefono === "function" ? p.getNroTelefono() : (p.nroTelefono || "");

    stmt.run(nombre, mail, nroTelefono, id);
  }

  public async delete(id: string): Promise<void> {
    this.db.prepare(`DELETE FROM proveedores WHERE id = ?`).run(id);
  }
}