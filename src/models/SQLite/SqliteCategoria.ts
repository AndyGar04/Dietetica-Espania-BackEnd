import { ICategoriaRepository } from "../repository/ICategoriaRepository";
import { Categoria } from "../categoria";

export class SqliteCategoriaRepository implements ICategoriaRepository {
    constructor(private db: import('@libsql/client').Client) {}

    public async save(categoria: Categoria): Promise<void> {
        await this.db.execute({
            sql: 'INSERT INTO categorias (id, nombre, activo) VALUES (?, ?, 1)',
            args: [categoria.getId(), categoria.getNombre()]
        });
    }

    public async findById(id: string): Promise<Categoria | null> {
        const result = await this.db.execute({
            sql: 'SELECT * FROM categorias WHERE id = ? AND activo = 1',
            args: [id]
        });
        const row = result.rows[0];
        if (!row) return null;
        return new Categoria(String(row['id']), String(row['nombre']));
    }

    public async findAll(): Promise<Categoria[]> {
        const result = await this.db.execute({
            sql: 'SELECT * FROM categorias WHERE activo = 1',
            args: []
        });
        return result.rows.map(row => new Categoria(String(row['id']), String(row['nombre'])));
    }

    public async update(categoria: Categoria): Promise<void> {
        await this.db.execute({
            sql: 'UPDATE categorias SET nombre = ? WHERE id = ?',
            args: [categoria.getNombre(), categoria.getId()]
        });
    }

    public async delete(id: string): Promise<void> {
        await this.db.execute({
            sql: 'UPDATE categorias SET activo = 0 WHERE id = ?',
            args: [id]
        });
    }
}
