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

        precioCompra REAL DEFAULT 0,

        precioVenta REAL DEFAULT 0,

        categoria TEXT DEFAULT '',

        proveedorNombre TEXT DEFAULT '',

        cantidad REAL DEFAULT 0,

        activo INTEGER NOT NULL DEFAULT 1,

        FOREIGN KEY (proveedorId)
        REFERENCES proveedores(id)
      );
    `;

    this.db.exec(query);

    const migraciones = [

      `
      ALTER TABLE productos
      ADD COLUMN precioCompra REAL DEFAULT 0
      `,

      `
      ALTER TABLE productos
      ADD COLUMN precioVenta REAL DEFAULT 0
      `,

      `
      ALTER TABLE productos
      ADD COLUMN categoria TEXT DEFAULT ''
      `,

      `
      ALTER TABLE productos
      ADD COLUMN proveedorNombre TEXT DEFAULT ''
      `
    ];

    migraciones.forEach((sql) => {

      try {

        this.db.prepare(sql).run();

      } catch {

      }
    });
  }

  public async save(
    p: any
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

        precioCompra,
        precioVenta,

        categoria,
        proveedorNombre,

        cantidad,
        activo

      )

      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const tipo =
      p instanceof ProductoSuelto
        ? "SUELTO"
        : "ENVASADO";

    stmt.run(

      p.getId(),

      p.getProveedor().getId(),

      p.getNombre(),

      p.isOferta() ? 1 : 0,

      tipo,

      p instanceof ProductoSuelto
        ? p.getPrecioPorGramo()
        : null,

      p instanceof ProductoEnvasado
        ? p.getPrecioUnitario()
        : null,

      p.precioCompra || 0,

      p.precioVenta || 0,

      p.categoria || "",

      p.proveedorNombre || "",

      p.getCantidad(),

      1
    );
  }

  public async findById(
    id: string
  ): Promise<any | null> {

    const stmt = this.db.prepare(`
      SELECT *
      FROM productos
      WHERE id = ?
      AND activo = 1
    `);

    const row: any = stmt.get(id);

    if (!row) return null;

    const proveedor =
      await this.proveedorRepo.findById(
        row.proveedorId
      );

    if (!proveedor) {
      throw new Error(
        "Proveedor no encontrado"
      );
    }

    let producto: any;

    if (row.tipo === "SUELTO") {

      producto = new ProductoSuelto(
        row.id,
        proveedor,
        row.nombre,
        row.oferta === 1,
        row.cantidad || 0,
        row.precioPorGramo
      );

    } else {

      producto = new ProductoEnvasado(

        row.id,

        proveedor,

        row.nombre,

        row.oferta === 1,

        row.precioUnitario,

        row.cantidad || 0
      );
    }

    producto.precioCompra =
      row.precioCompra || 0;

    producto.precioVenta =
      row.precioVenta ||
      row.precioUnitario ||
      0;

    producto.categoria =
      row.categoria || "";

    producto.proveedorNombre =
      row.proveedorNombre || "";

    producto.cantidad =
      row.cantidad || 0;

    producto.proveedorId =
      row.proveedorId || "1";

    return producto;
  }

  public async findAll(): Promise<any[]> {

    const stmt = this.db.prepare(`
      SELECT *
      FROM productos
      WHERE activo = 1
    `);

    const rows: any[] = stmt.all();

    const productos = await Promise.all(

      rows.map((row) =>
        this.findById(row.id)
      )
    );

    return productos;
  }

  public async update(
    p: any
  ): Promise<void> {

    const stmt = this.db.prepare(`
      UPDATE productos
      SET

        proveedorId = ?,

        nombre = ?,

        oferta = ?,

        precioPorGramo = ?,

        precioUnitario = ?,

        precioCompra = ?,

        precioVenta = ?,

        categoria = ?,

        proveedorNombre = ?,

        cantidad = ?

      WHERE id = ?
    `);

    stmt.run(

      p.proveedorId || "1",

      p.nombre,

      p.oferta ? 1 : 0,

      p instanceof ProductoSuelto
        ? p.getPrecioPorGramo()
        : null,

      p instanceof ProductoEnvasado
        ? p.getPrecioUnitario()
        : p.precioVenta,

      p.precioCompra || 0,

      p.precioVenta || 0,

      p.categoria || "",

      p.proveedorNombre || "",

      p.cantidad || 0,

      p.id
    );
  }

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