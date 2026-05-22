import { Proveedor } from "../proveedor";
import { IProveedorRepository } from "../repository/IProveedorRepository";

export class SqliteProveedorRepository implements IProveedorRepository {
  constructor(private db: import('@libsql/client').Client) {}

  public async save(p: any): Promise<void> {
    const id = typeof p.getId === "function" ? p.getId() : p.id;
    const nombre = typeof p.getNombre === "function" ? p.getNombre() : (p.nombre || p.razonSocial || "");
    const mail = typeof p.getMail === "function" ? p.getMail() : (p.mail || "");
    const nroTelefono = typeof p.getNroTelefono === "function" ? p.getNroTelefono() : (p.nroTelefono || "");

    await this.db.execute({
      sql: 'INSERT INTO proveedores (id, nombre, mail, nroTelefono) VALUES (?, ?, ?, ?)',
      args: [id, nombre, mail, nroTelefono]
    });
  }

  public async findById(id: string): Promise<Proveedor | null> {
    const result = await this.db.execute({ sql: 'SELECT * FROM proveedores WHERE id = ?', args: [id] });
    const row = result.rows[0];
    if (!row) return null;
    return new Proveedor(String(row['id']), String(row['nombre'] || ''), String(row['mail'] || ''), String(row['nroTelefono'] || ''));
  }

  public async findAll(): Promise<Proveedor[]> {
    const result = await this.db.execute({ sql: 'SELECT * FROM proveedores', args: [] });
    return result.rows.map(row => new Proveedor(String(row['id']), String(row['nombre'] || ''), String(row['mail'] || ''), String(row['nroTelefono'] || '')));
  }

  public async update(p: any): Promise<void> {
    const id = typeof p.getId === "function" ? p.getId() : p.id;
    const nombre = typeof p.getNombre === "function" ? p.getNombre() : (p.nombre || p.razonSocial || "");
    const mail = typeof p.getMail === "function" ? p.getMail() : (p.mail || "");
    const nroTelefono = typeof p.getNroTelefono === "function" ? p.getNroTelefono() : (p.nroTelefono || "");

    await this.db.execute({
      sql: 'UPDATE proveedores SET nombre = ?, mail = ?, nroTelefono = ? WHERE id = ?',
      args: [nombre, mail, nroTelefono, id]
    });
  }

  public async delete(id: string): Promise<void> {
    await this.db.execute({ sql: 'DELETE FROM proveedores WHERE id = ?', args: [id] });
  }
}
