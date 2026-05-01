import Database from "better-sqlite3";
import { Proveedor } from "../proveedor";
import { IProveedorRepository } from "../repository/IProveedorRepository";

export class SqliteProveedorRepository implements IProveedorRepository {
    private db: Database.Database;

    constructor(dbPath: string) {
        this.db = new Database(dbPath);
        this.init();
    }

    // Crea la tabla
    private init(): void {
        const query = `
            CREATE TABLE IF NOT EXISTS proveedores (
                id TEXT PRIMARY KEY,
                mail TEXT NOT NULL,
                nroTelefono TEXT NOT NULL
            );
        `;
        this.db.exec(query);
    }

    public async save(p: Proveedor): Promise<void> {
        const stmt = this.db.prepare(
            "INSERT INTO proveedores (id, mail, nroTelefono) VALUES (?, ?, ?)"
        );

        stmt.run(p.getId(), p.getMail(), p.getNroTelefono());
    }

    public async findById(id: string): Promise<Proveedor | null> {
        const stmt = this.db.prepare("SELECT * FROM proveedores WHERE id = ?");
        const row: any = stmt.get(id);

        if (!row) return null;

        return new Proveedor(row.id, row.mail, row.nroTelefono);
    }

    public async findAll(): Promise<Proveedor[]> {
        const stmt = this.db.prepare("SELECT * FROM proveedores");
        const rows = stmt.all();

        return rows.map((row: any) => new Proveedor(row.id, row.mail, row.nroTelefono));
    }

    public async update(p: Proveedor): Promise<void> {
        const stmt = this.db.prepare(
            "UPDATE proveedores SET mail = ?, nroTelefono = ? WHERE id = ?"
        );
        stmt.run(p.getMail(), p.getNroTelefono(), p.getId());
    }

    public async delete(id: string): Promise<void> {
        const stmt = this.db.prepare("DELETE FROM proveedores WHERE id = ?");
        stmt.run(id);
    }
}