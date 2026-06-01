import { Producto } from "../producto";
import { ProductoSuelto } from "../productoSuelto";
import { ProductoEnvasado } from "../productoEnvasado";
import { Proveedor } from "../proveedor";
import { IProductoRepository } from "../repository/IProductoRepository";

export class SqliteProductoRepository implements IProductoRepository {
  constructor(private db: import("@libsql/client").Client) {}

  public async save(p: any): Promise<void> {
    const esSuelto = p instanceof ProductoSuelto || p.tipo === "suelto";
    const tipoDato = esSuelto ? "suelto" : "envasado";

    let precioFinal = 0;

    if (esSuelto && typeof p.getPrecioPorGramo === "function") {
      precioFinal = p.getPrecioPorGramo();
    } else if (!esSuelto && typeof p.getPrecioUnitario === "function") {
      precioFinal = p.getPrecioUnitario();
    } else {
      precioFinal = p.precioVenta || 0;
    }

    await this.db.execute({
      sql: `
        INSERT INTO productos (
          id,
          nombre,
          tipo,
          precioCompra,
          precioVenta,
          cantidad,
          oferta,
          categoria,
          proveedorId,
          fechaVencimiento
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
        p.id || p.getId?.(),
        p.nombre || p.getNombre?.(),
        tipoDato,
        p.precioCompra || 0,
        precioFinal,
        p.cantidad || p.getCantidad?.() || 0,
        p.oferta ? 1 : 0,
        p.categoria || p.categoriaId || "",
        p.proveedorId || p.proveedor?.id || "",
        p.fechaVencimiento
          ? new Date(p.fechaVencimiento).toISOString()
          : null,
      ],
    });
  }

  public async update(p: any): Promise<void> {
    const esSuelto = p instanceof ProductoSuelto || p.tipo === "suelto";
    const tipoDato = esSuelto ? "suelto" : "envasado";

    let precioFinal = 0;

    if (esSuelto && typeof p.getPrecioPorGramo === "function") {
      precioFinal = p.getPrecioPorGramo();
    } else if (!esSuelto && typeof p.getPrecioUnitario === "function") {
      precioFinal = p.getPrecioUnitario();
    } else {
      precioFinal = p.precioVenta || 0;
    }

    await this.db.execute({
      sql: `
        UPDATE productos
        SET
          nombre = ?,
          tipo = ?,
          precioCompra = ?,
          precioVenta = ?,
          cantidad = ?,
          oferta = ?,
          categoria = ?,
          proveedorId = ?,
          fechaVencimiento = ?
        WHERE id = ?
      `,
      args: [
        p.nombre || p.getNombre?.(),
        tipoDato,
        p.precioCompra || 0,
        precioFinal,
        p.cantidad || p.getCantidad?.() || 0,
        p.oferta ? 1 : 0,
        p.categoria || p.categoriaId || "",
        p.proveedorId || p.proveedor?.id || "",
        p.fechaVencimiento
          ? new Date(p.fechaVencimiento).toISOString()
          : null,
        p.id || p.getId?.(),
      ],
    });
  }

  public async findAll(): Promise<Producto[]> {
    const result = await this.db.execute({
      sql: "SELECT * FROM productos",
      args: [],
    });

    return result.rows.map((row) => this.mapearInstancia(row));
  }

  public async findById(id: string): Promise<Producto | null> {
    const result = await this.db.execute({
      sql: "SELECT * FROM productos WHERE id = ?",
      args: [id],
    });

    const row = result.rows[0];

    if (!row) return null;

    return this.mapearInstancia(row);
  }

  public async delete(id: string): Promise<void> {
    await this.db.execute({
      sql: "DELETE FROM productos WHERE id = ?",
      args: [id],
    });
  }

  public async decrementarStock(
    productoId: string,
    cantidad: number
  ): Promise<boolean> {
    const result = await this.db.execute({
      sql: `
        UPDATE productos
        SET cantidad = cantidad - ?
        WHERE id = ? AND cantidad >= ?
      `,
      args: [cantidad, productoId, cantidad],
    });

    return (result.rowsAffected ?? 0) > 0;
  }

  private mapearInstancia(row: any): Producto {
    const provTemp = new Proveedor(
      String(row.proveedorId || ""),
      "Proveedor Asociado",
      "",
      ""
    );

    const precioCompra = Number(row.precioCompra ?? 0);

    let producto: Producto;

    if (String(row.tipo) === "suelto") {
      producto = new ProductoSuelto(
        String(row.id),
        provTemp,
        String(row.nombre),
        Boolean(Number(row.oferta)),
        Number(row.cantidad),
        Number(row.precioVenta),
        precioCompra
      );
    } else {
      producto = new ProductoEnvasado(
        String(row.id),
        provTemp,
        String(row.nombre),
        Boolean(Number(row.oferta)),
        Number(row.precioVenta),
        Number(row.cantidad),
        precioCompra
      );
    }

    (producto as any).precioVenta = Number(row.precioVenta ?? 0);
    (producto as any).categoria = String(row.categoria || "");
    (producto as any).proveedorId = String(row.proveedorId || "");
    (producto as any).tipo = String(row.tipo || "envasado");
    (producto as any).fechaVencimiento = row.fechaVencimiento
      ? String(row.fechaVencimiento)
      : null;

    return producto;
  }
}