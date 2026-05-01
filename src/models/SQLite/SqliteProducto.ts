import Database from "better-sqlite3";
import { IProductoRepository } from "../repository/IProductoRepository";
import { Producto } from "../producto";
import { ProductoSuelto } from "../productoSuelto";
import { ProductoEnvasado } from "../productoEnvasado";
import { IProveedorRepository } from "../repository/IProveedorRepository";

export class SqliteProductoRepository implements IProductoRepository{
    private db: Database.Database;

    constructor (
        dbPath: string, 
        private proveedorRepo: IProveedorRepository
    ){
        this.db = new Database(dbPath);
        this.init();
    }
    
private init(): void {
        const query = `
            CREATE TABLE IF NOT EXISTS productos (
                id TEXT PRIMARY KEY,
                proveedorId TEXT NOT NULL,
                nombre TEXT NOT NULL,
                oferta INTEGER NOT NULL,
                tipo TEXT NOT NULL, -- 'SUELTO' o 'ENVASADO'
                precioPorGramo REAL,
                precioUnitario REAL,
                FOREIGN KEY (proveedorId) REFERENCES proveedores(id)
            );
        `;
        this.db.exec(query);
    }

    public async save(p: Producto): Promise<void> {
        const stmt = this.db.prepare(`
            INSERT INTO productos (id, proveedorId, nombre, oferta, tipo, precioPorGramo, precioUnitario)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `);

        const tipo = p instanceof ProductoSuelto ? 'SUELTO' : 'ENVASADO';
        const precioPorGramo = p instanceof ProductoSuelto ? p.getPrecioPorGramo() : null;
        const precioUnitario = p instanceof ProductoEnvasado ? p.getPrecioUnitario() : null;

        stmt.run(
            p.getId(),
            p.getProveedor().getId(),
            p.getNombre(),
            p.isOferta() ? 1 : 0,
            tipo,
            precioPorGramo,
            precioUnitario
        );
    }

    public async findById(id: string): Promise<Producto | null> {
        const stmt = this.db.prepare("SELECT * FROM productos WHERE id = ?");
        const row: any = stmt.get(id);

        if (!row) return null;

        const proveedor = await this.proveedorRepo.findById(row.proveedorId);
        if (!proveedor) throw new Error("Proveedor no encontrado en la DB");

        if (row.tipo === 'SUELTO') {
            return new ProductoSuelto(
                row.id,
                proveedor,
                row.nombre,
                row.oferta === 1,
                row.precioPorGramo
            );
        } else {
            return new ProductoEnvasado(
                row.id,
                proveedor,
                row.nombre,
                row.oferta === 1,
                row.precioUnitario
            );
        }
    }

    public async findAll(): Promise<Producto[]> {
        const stmt = this.db.prepare("SELECT * FROM productos");
        const rows = stmt.all();
        
        return Promise.all(rows.map(row => this.findById((row as any).id))) as Promise<Producto[]>;
    }

    public async update(p: Producto): Promise<void> {
        const stmt = this.db.prepare(`
            UPDATE productos 
            SET proveedorId = ?, nombre = ?, oferta = ?, precioPorGramo = ?, precioUnitario = ?
            WHERE id = ?
        `);

        const precioPorGramo = p instanceof ProductoSuelto ? p.getPrecioPorGramo() : null;
        const precioUnitario = p instanceof ProductoEnvasado ? p.getPrecioUnitario() : null;

        stmt.run(
            p.getProveedor().getId(),
            p.getNombre(),
            p.isOferta() ? 1 : 0,
            precioPorGramo,
            precioUnitario,
            p.getId()
        );
    }

    public async delete(id: string): Promise<void> {
        this.db.prepare("DELETE FROM productos WHERE id = ?").run(id);
    }

}
