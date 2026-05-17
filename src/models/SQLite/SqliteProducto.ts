import Database from "better-sqlite3";
import { IProductoRepository } from "../repository/IProductoRepository";
import { Producto } from "../producto";
import { ProductoSuelto } from "../productoSuelto";
import { ProductoEnvasado } from "../productoEnvasado";
import { IProveedorRepository } from "../repository/IProveedorRepository";
import { ICategoriaRepository } from "../repository/ICategoriaRepository";

export class SqliteProductoRepository implements IProductoRepository {
  private db: Database.Database;

  constructor(
    dbPath: string,
    private proveedorRepo: IProveedorRepository,
    private categoriaRepo: ICategoriaRepository
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
        FOREIGN KEY (proveedorId) REFERENCES proveedores(id)
      );
    `;
    this.db.exec(query);

    const migraciones = [
      `ALTER TABLE productos ADD COLUMN precioCompra REAL DEFAULT 0`,
      `ALTER TABLE productos ADD COLUMN precioVenta REAL DEFAULT 0`,
      `ALTER TABLE productos ADD COLUMN categoria TEXT DEFAULT ''`,
      `ALTER TABLE productos ADD COLUMN proveedorNombre TEXT DEFAULT ''`
    ];

    migraciones.forEach((sql) => {
      try {
        this.db.prepare(sql).run();
      } catch {}
    });
  }

  public async save(p: Producto): Promise<void> {
    const stmt = this.db.prepare(`
      INSERT INTO productos (
        id, proveedorId, nombre, oferta, tipo,
        precioPorGramo, precioUnitario, precioCompra, precioVenta,
        categoria, proveedorNombre, cantidad, activo
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const tipo = p instanceof ProductoSuelto ? "SUELTO" : "ENVASADO";
    
    const categoriaId = p.categoria ? p.categoria.getId() : "";

    stmt.run(
      p.getId(),
      p.getProveedor().getId(),
      p.getNombre(),
      p.isOferta() ? 1 : 0,
      tipo,
      p instanceof ProductoSuelto ? p.getPrecioPorGramo() : null,
      p instanceof ProductoEnvasado ? p.getPrecioUnitario() : null,
      (p as any).precioCompra || 0,
      (p as any).precioVenta || 0,
      categoriaId,
      (p as any).proveedorNombre || "",
      p.getCantidad(),
      1
    );
  }

  public async findById(id: string): Promise<Producto | null> {
    const stmt = this.db.prepare(`
      SELECT * FROM productos WHERE id = ? AND activo = 1
    `);
    const row: any = stmt.get(id);
    if (!row) return null;

    const proveedor = await this.proveedorRepo.findById(row.proveedorId);
    if (!proveedor) {
      throw new Error("Proveedor no encontrado");
    }

    const categoriaObj = row.categoria ? await this.categoriaRepo.findById(row.categoria) : null;

    let producto: Producto;

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

    producto.categoria = categoriaObj;

    (producto as any).precioCompra = row.precioCompra || 0;
    (producto as any).precioVenta = row.precioVenta || row.precioUnitario || 0;
    (producto as any).proveedorNombre = row.proveedorNombre || "";
    (producto as any).cantidad = row.cantidad || 0;
    (producto as any).proveedorId = row.proveedorId || "1";

    return producto;
  }

  public async findAll(): Promise<Producto[]> {
    const stmt = this.db.prepare(`
      SELECT id FROM productos WHERE activo = 1
    `);
    const rows: any[] = stmt.all();

    const productos = await Promise.all(
      rows.map((row) => this.findById(row.id))
    );

    return productos.filter((p): p is Producto => p !== null);
  }

  public async update(p: Producto): Promise<void> {
    const stmt = this.db.prepare(`
      UPDATE productos SET
        proveedorId = ?, nombre = ?, oferta = ?,
        precioPorGramo = ?, precioUnitario = ?,
        precioCompra = ?, precioVenta = ?,
        categoria = ?, proveedorNombre = ?, cantidad = ?
      WHERE id = ?
    `);

    const categoriaId = p.categoria ? p.categoria.getId() : "";

    stmt.run(
      (p as any).proveedorId || p.getProveedor().getId() || "1",
      p.getNombre(),
      p.isOferta() ? 1 : 0,
      p instanceof ProductoSuelto ? p.getPrecioPorGramo() : null,
      p instanceof ProductoEnvasado ? p.getPrecioUnitario() : (p as any).precioVenta,
      (p as any).precioCompra || 0,
      (p as any).precioVenta || 0,
      categoriaId,
      (p as any).proveedorNombre || "",
      p.getCantidad() || 0,
      p.getId()
    );
  }

  public async delete(id: string): Promise<void> {
    const stmt = this.db.prepare(`
      UPDATE productos SET activo = 0 WHERE id = ?
    `);
    stmt.run(id);
  }
}