import Database from "better-sqlite3";
import { Producto } from "../producto";
import { ProductoSuelto } from "../productoSuelto";
import { ProductoEnvasado } from "../productoEnvasado";
import { Proveedor } from "../proveedor";
import { IProductoRepository } from "../repository/IProductoRepository";

export class SqliteProductoRepository implements IProductoRepository {
  private db: Database.Database;

  constructor(dbPath: string) {
    this.db = new Database(dbPath);
    this.init();
  }

  private init(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS productos (
        id TEXT PRIMARY KEY,
        nombre TEXT NOT NULL
      );
    `);

    const columnas = [
      "tipo TEXT DEFAULT 'envasado'",
      "precioCompra REAL DEFAULT 0",
      "precioVenta REAL DEFAULT 0",
      "cantidad INTEGER DEFAULT 0",
      "oferta INTEGER DEFAULT 0",
      "categoria TEXT DEFAULT ''",
      "proveedorId TEXT DEFAULT ''"
    ];

    columnas.forEach((col) => {
      try { this.db.exec(`ALTER TABLE productos ADD COLUMN ${col};`); } catch {}
    });
  }

  public async save(p: any): Promise<void> {
    const stmt = this.db.prepare(`
      INSERT INTO productos (id, nombre, tipo, precioCompra, precioVenta, cantidad, oferta, categoria, proveedorId)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

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

    stmt.run(
      p.id || p.getId?.(),
      p.nombre || p.getNombre?.(),
      tipoDato,
      p.precioCompra || 0,
      precioFinal,
      p.cantidad || p.getCantidad?.() || 0,
      p.oferta ? 1 : 0,
      p.categoria || p.categoriaId || "",
      p.proveedorId || p.proveedor?.id || ""
    );
  }

  public async update(p: any): Promise<void> {
    const stmt = this.db.prepare(`
      UPDATE productos SET
        nombre = ?, tipo = ?, precioCompra = ?, precioVenta = ?, cantidad = ?, oferta = ?, categoria = ?, proveedorId = ?
      WHERE id = ?
    `);

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

    stmt.run(
      p.nombre || p.getNombre?.(),
      tipoDato,
      p.precioCompra || 0,
      precioFinal,
      p.cantidad || p.getCantidad?.() || 0,
      p.oferta ? 1 : 0,
      p.categoria || p.categoriaId || "",
      p.proveedorId || p.proveedor?.id || "",
      p.id || p.getId?.()
    );
  }

  public async findAll(): Promise<Producto[]> {
    const stmt = this.db.prepare(`SELECT * FROM productos`);
    const rows: any[] = stmt.all();

    return rows.map(row => this.mapearInstancia(row));
  }

  public async findById(id: string): Promise<Producto | null> {
    const stmt = this.db.prepare(`SELECT * FROM productos WHERE id = ?`);
    const row: any = stmt.get(id);

    if (!row) return null;
    return this.mapearInstancia(row);
  }

  public async delete(id: string): Promise<void> {
    this.db.prepare(`DELETE FROM productos WHERE id = ?`).run(id);
  }

  private mapearInstancia(row: any): Producto {
    const provTemp = new Proveedor(row.proveedorId || "", "Proveedor Asociado", "", "");
    let producto: any;

    if (row.tipo === "suelto") {
      producto = new ProductoSuelto(row.id, provTemp, row.nombre, Boolean(row.oferta), row.cantidad, row.precioVenta);
    } else {
      producto = new ProductoEnvasado(row.id, provTemp, row.nombre, Boolean(row.oferta), row.precioVenta, row.cantidad);
    }

    producto.precioCompra = row.precioCompra || 0;
    producto.precioVenta = row.precioVenta || 0;
    producto.categoria = row.categoria || "";
    producto.proveedorId = row.proveedorId || "";
    producto.tipo = row.tipo || "envasado";

    return producto;
  }
}