import Database from "better-sqlite3";
import { IVentaRepository } from "../repository/IVentaRepository";
import { Venta } from "../venta";
import { ItemVenta } from "../producto-venta";
import { IProductoRepository } from "../repository/IProductoRepository";

export class SqliteVentaRepository implements IVentaRepository {
    private db: Database.Database;

    constructor(dbPath: string, private productoRepo: IProductoRepository) {
        this.db = new Database(dbPath);
        this.init();
    }

    private init(): void {
        // Tabla para el encabezado de la venta
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS ventas (
                id TEXT PRIMARY KEY,
                fecha TEXT NOT NULL
            );
        `);

        // Tabla para el detalle (relación N:1 con ventas y productos)
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS venta_items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                ventaId TEXT NOT NULL,
                productoId TEXT NOT NULL,
                cantidad REAL NOT NULL,
                FOREIGN KEY (ventaId) REFERENCES ventas(id),
                FOREIGN KEY (productoId) REFERENCES productos(id)
            );
        `);
    }

    public async save(venta: Venta): Promise<void> {
        // Definimos la transacción para asegurar integridad
        const insertVenta = this.db.prepare("INSERT INTO ventas (id, fecha) VALUES (?, ?)");
        const insertItem = this.db.prepare("INSERT INTO venta_items (ventaId, productoId, cantidad) VALUES (?, ?, ?)");

        const operacionVenta = this.db.transaction((v: Venta) => {
            // 1. Guardar encabezado
            insertVenta.run(v.getId(), v.getFecha().toISOString());

            // 2. Guardar cada item
            for (const item of v.getItems()) {
                insertItem.run(
                    v.getId(),
                    item.getProducto().getId(),
                    item.getCantidad()
                );
            }
        });

        operacionVenta(venta);
    }

    public async findById(id: string): Promise<Venta | null> {
        const ventaRow: any = this.db.prepare("SELECT * FROM ventas WHERE id = ?").get(id);
        if (!ventaRow) return null;

        const nuevaVenta = new Venta(ventaRow.id, new Date(ventaRow.fecha));

        // Buscamos los items de esta venta
        const itemsRows = this.db.prepare("SELECT * FROM venta_items WHERE ventaId = ?").all(id);

        for (const row of itemsRows as any[]) {
            const producto = await this.productoRepo.findById(row.productoId);
            if (producto) {
                nuevaVenta.agregarItem(new ItemVenta(producto, row.cantidad));
            }
        }

        return nuevaVenta;
    }

    public async findAll(): Promise<Venta[]> {
        const rows = this.db.prepare("SELECT id FROM ventas").all();
        // Reutilizamos findById para cada ID (así traemos los items también)
        return Promise.all(rows.map(row => this.findById((row as any).id))) as Promise<Venta[]>;
    }
}