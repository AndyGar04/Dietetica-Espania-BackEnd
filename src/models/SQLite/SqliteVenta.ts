import { IVentaRepository } from "../repository/IVentaRepository";
import { Venta } from "../venta";
import { ItemVenta } from "../producto-venta";
import { IProductoRepository } from "../repository/IProductoRepository";

export class SqliteVentaRepository implements IVentaRepository {
    constructor(private db: import('@libsql/client').Client, private productoRepo: IProductoRepository) {}

    public async save(venta: Venta): Promise<void> {
        const statements = [
            {
                sql: 'INSERT INTO ventas (id, fecha) VALUES (?, ?)',
                args: [venta.getId(), venta.getFecha().toISOString()]
            },
            ...venta.getItems().map(item => ({
                sql: 'INSERT INTO venta_items (ventaId, productoId, cantidad, precioUnitario, subtotal) VALUES (?, ?, ?, ?, ?)',
                args: [
                    venta.getId(),
                    item.getProducto().getId(),
                    item.getCantidad(),
                    item.getPrecioUnitario(),
                    item.getSubtotal()
                ]
            }))
        ];
        await this.db.batch(statements, 'write');
    }

    public async findById(id: string): Promise<Venta | null> {
        const ventaResult = await this.db.execute({ sql: 'SELECT * FROM ventas WHERE id = ?', args: [id] });
        const ventaRow = ventaResult.rows[0];
        if (!ventaRow) return null;

        const nuevaVenta = new Venta(String(ventaRow['id']), new Date(String(ventaRow['fecha'])));

        const itemsResult = await this.db.execute({ sql: 'SELECT * FROM venta_items WHERE ventaId = ?', args: [id] });
        for (const row of itemsResult.rows) {
            const producto = await this.productoRepo.findById(String(row['productoId']));
            if (producto) {
                const item = ItemVenta.fromHistorico(
                    producto,
                    Number(row['cantidad']),
                    Number(row['precioUnitario']),
                    Number(row['subtotal'])
                );
                nuevaVenta.agregarItem(item);
            }
        }

        return nuevaVenta;
    }

    public async findAll(): Promise<Venta[]> {
        const result = await this.db.execute({ sql: 'SELECT id FROM ventas', args: [] });
        return Promise.all(result.rows.map(row => this.findById(String(row['id'])))) as Promise<Venta[]>;
    }
}
