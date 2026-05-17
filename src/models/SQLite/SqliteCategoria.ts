import Database from "better-sqlite3";
import { ICategoriaRepository } from "../repository/ICategoriaRepository";
import { Categoria } from "../categoria";

export class SqliteCategoriaRepository implements ICategoriaRepository {
    private db: Database.Database;

    constructor(dbPath: string) {
        this.db = new Database(dbPath);
        this.init();
    }

    private init(): void {
        const query = `
            CREATE TABLE IF NOT EXISTS categorias (
                id TEXT PRIMARY KEY,
                nombre TEXT NOT NULL,
                activo INTEGER NOT NULL DEFAULT 1
            );
        `;
        this.db.exec(query);
    }

    public async save(categoria: Categoria): Promise<void> {
        const stmt = this.db.prepare(`
            INSERT INTO categorias (id, nombre, activo)
            VALUES (?, ?, 1)
        `);
        stmt.run(categoria.getId(), categoria.getNombre());
    }

    public async findById(id: string): Promise<Categoria | null> {
        const stmt = this.db.prepare(`
            SELECT * FROM categorias 
            WHERE id = ? AND activo = 1
        `);
        const row: any = stmt.get(id);
        if (!row) return null;
        return new Categoria(row.id, row.nombre);
    }

    public async findAll(): Promise<Categoria[]> {
        const stmt = this.db.prepare(`
            SELECT * FROM categorias 
            WHERE activo = 1
        `);
        const rows: any[] = stmt.all();
        return rows.map(row => new Categoria(row.id, row.nombre));
    }

    public async update(categoria: Categoria): Promise<void> {
        const stmt = this.db.prepare(`
            UPDATE categorias 
            SET nombre = ? 
            WHERE id = ?
        `);
        stmt.run(categoria.getNombre(), categoria.getId());
    }

    public async delete(id: string): Promise<void> {
        const stmt = this.db.prepare(`
            UPDATE categorias 
            SET activo = 0 
            WHERE id = ?
        `);
        stmt.run(id);
    }
}