import { IVentaRepository } from "../repository/IVentaRepository";
import { Venta } from "../venta";
import { ItemVenta } from "../producto-venta";

export class SqliteVentaRepository implements IVentaRepository {
    constructor(private db: import('@libsql/client').Client) {}

    public async save(venta: Venta): Promise<void> {
        const tx = await this.db.transaction('write');
        try {
            for (const item of venta.getItems()) {
                const res = await tx.execute({
                    sql: 'UPDATE productos SET cantidad = cantidad - ? WHERE id = ? AND cantidad >= ?',
                    args: [item.getCantidad(), item.getProductoId(), item.getCantidad()]
                });
                if ((res.rowsAffected ?? 0) === 0) {
                    throw new Error(`Stock insuficiente o producto inexistente: ${item.getProductoId()}`);
                }
            }

            await tx.execute({
                sql: 'INSERT INTO ventas (id, fecha, total, metodoPago) VALUES (?, ?, ?, ?)',
                args: [
                    venta.getId(),
                    venta.getFecha().toISOString(),
                    venta.getTotalVenta(),
                    venta.getMetodoPago()
                ]
            });

            for (const item of venta.getItems()) {
                await tx.execute({
                    sql: 'INSERT INTO venta_items (ventaId, productoId, nombre, cantidad, precioUnitario, precioCompraUnitario, descuento, subtotal) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                    args: [
                        venta.getId(),
                        item.getProductoId(),
                        item.getNombre(),
                        item.getCantidad(),
                        item.getPrecioUnitario(),
                        item.getPrecioCompraUnitario(),
                        item.getDescuento(),
                        item.getSubtotal()
                    ]
                });
            }

            await tx.commit();
        } catch (e) {
            await tx.rollback();
            throw e;
        }
    }

    public async findById(id: string): Promise<Venta | null> {
        const ventaResult = await this.db.execute({ sql: 'SELECT * FROM ventas WHERE id = ?', args: [id] });
        const ventaRow = ventaResult.rows[0];
        if (!ventaRow) return null;

        const nuevaVenta = new Venta(
            String(ventaRow['id']),
            new Date(String(ventaRow['fecha'])),
            String(ventaRow['metodoPago'] ?? 'efectivo')
        );

        const itemsResult = await this.db.execute({ sql: 'SELECT * FROM venta_items WHERE ventaId = ?', args: [id] });
        for (const row of itemsResult.rows) {
            const item = ItemVenta.fromHistorico(
                String(row['productoId']),
                String(row['nombre'] ?? ''),
                Number(row['cantidad']),
                Number(row['precioUnitario']),
                Number(row['precioCompraUnitario'] ?? 0),
                Number(row['descuento'] ?? 0),
                Number(row['subtotal'])
            );
            nuevaVenta.agregarItem(item);
        }

        return nuevaVenta;
    }

    public async findAll(): Promise<Venta[]> {
        const result = await this.db.execute({ sql: 'SELECT id FROM ventas', args: [] });
        const ventas = await Promise.all(result.rows.map(row => this.findById(String(row['id']))));
        return ventas.filter((v): v is Venta => v !== null);
    }
}
