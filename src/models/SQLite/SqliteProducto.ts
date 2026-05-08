import Database from "better-sqlite3";
import { IProductoRepository } from "../repository/IProductoRepository";
import { Producto } from "../producto";
import { ProductoSuelto } from "../productoSuelto";
import { ProductoEnvasado } from "../productoEnvasado";
import { IProveedorRepository } from "../repository/IProveedorRepository";

export class SqliteProductoRepository
    implements IProductoRepository {

    private db: Database.Database;

    constructor(
        dbPath: string,
        private proveedorRepo: IProveedorRepository
    ) {
        this.db = new Database(dbPath);

        this.init();
    }

    // =========================
    // INIT DB
    // =========================
    private init(): void {

        const query = `
            CREATE TABLE IF NOT EXISTS productos (
                id TEXT PRIMARY KEY,
                proveedorId TEXT NOT NULL,
                nombre TEXT NOT NULL,
                oferta INTEGER NOT NULL,
                tipo TEXT NOT NULL,
                precioPorGramo REAL,
                precioUnitario REAL,
                cantidad REAL DEFAULT 0,
                activo INTEGER NOT NULL DEFAULT 1,
                FOREIGN KEY (proveedorId) REFERENCES proveedores(id)
            );
        `;

        this.db.exec(query);

        // =========================
        // AGREGAR COLUMNA ACTIVO
        // =========================
        try {
            this.db
                .prepare(`
                    ALTER TABLE productos
                    ADD COLUMN activo INTEGER NOT NULL DEFAULT 1
                `)
                .run();
        } catch (err) {
            // Ignorar si ya existe
        }

        // =========================
        // AGREGAR COLUMNA CANTIDAD
        // =========================
        try {
            this.db
                .prepare(`
                    ALTER TABLE productos
                    ADD COLUMN cantidad REAL DEFAULT 0
                `)
                .run();
        } catch (err) {
            // Ignorar si ya existe
        }
    }

    // =========================
    // SAVE
    // =========================
    public async save(
        p: Producto
    ): Promise<void> {

        const stmt = this.db.prepare(`
            INSERT INTO productos (
                id,
                proveedorId,
                nombre,
                oferta,
                tipo,
                precioPorGramo,
                precioUnitario,
                cantidad,
                activo
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        const tipo =
            p instanceof ProductoSuelto
                ? "SUELTO"
                : "ENVASADO";

        const precioPorGramo =
            p instanceof ProductoSuelto
                ? p.getPrecioPorGramo()
                : null;

        const precioUnitario =
            p instanceof ProductoEnvasado
                ? p.getPrecioUnitario()
                : null;

        const cantidad =
            p instanceof ProductoEnvasado
                ? (p as any).cantidad || 0
                : 0;

        stmt.run(
            p.getId(),
            p.getProveedor().getId(),
            p.getNombre(),
            p.isOferta() ? 1 : 0,
            tipo,
            precioPorGramo,
            precioUnitario,
            cantidad,
            1
        );
    }

    // =========================
    // FIND BY ID
    // =========================
    public async findById(
        id: string
    ): Promise<Producto | null> {

        const stmt = this.db.prepare(`
            SELECT *
            FROM productos
            WHERE id = ?
            AND activo = 1
        `);

        const row: any = stmt.get(id);

        if (!row) {
            return null;
        }

        const proveedor =
            await this.proveedorRepo.findById(
                row.proveedorId
            );

        if (!proveedor) {
            throw new Error(
                "Proveedor no encontrado en la DB"
            );
        }

        // =========================
        // PRODUCTO SUELTO
        // =========================
        if (row.tipo === "SUELTO") {

            const producto =
                new ProductoSuelto(
                    row.id,
                    proveedor,
                    row.nombre,
                    row.oferta === 1,
                    row.precioPorGramo
                );

            if (
                typeof (producto as any)
                    .setCantidad === "function"
            ) {
                (producto as any)
                    .setCantidad(row.cantidad || 0);
            }

            return producto;
        }

        // =========================
        // PRODUCTO ENVASADO
        // =========================
        const producto =
            new ProductoEnvasado(
                row.id,
                proveedor,
                row.nombre,
                row.oferta === 1,
                row.precioUnitario,
                row.cantidad || 0
            );

        return producto;
    }

    // =========================
    // FIND ALL
    // =========================
    public async findAll(): Promise<Producto[]> {

        const stmt = this.db.prepare(`
            SELECT *
            FROM productos
            WHERE activo = 1
        `);

        const rows = stmt.all();

        return Promise.all(
            rows.map((row: any) =>
                this.findById(row.id)
            )
        ) as Promise<Producto[]>;
    }

    // =========================
    // UPDATE
    // =========================
    public async update(
        p: Producto
    ): Promise<void> {

        const stmt = this.db.prepare(`
            UPDATE productos
            SET
                proveedorId = ?,
                nombre = ?,
                oferta = ?,
                precioPorGramo = ?,
                precioUnitario = ?,
                cantidad = ?
            WHERE id = ?
        `);

        const precioPorGramo =
            p instanceof ProductoSuelto
                ? p.getPrecioPorGramo()
                : null;

        const precioUnitario =
            p instanceof ProductoEnvasado
                ? p.getPrecioUnitario()
                : null;

        const cantidad =
            p instanceof ProductoEnvasado
                ? (p as any).cantidad || 0
                : 0;

        stmt.run(
            p.getProveedor().getId(),
            p.getNombre(),
            p.isOferta() ? 1 : 0,
            precioPorGramo,
            precioUnitario,
            cantidad,
            p.getId()
        );
    }

    // =========================
    // SOFT DELETE
    // =========================
    public async delete(
        id: string
    ): Promise<void> {

        const stmt = this.db.prepare(`
            UPDATE productos
            SET activo = 0
            WHERE id = ?
        `);

        stmt.run(id);
    }
}