import 'dotenv/config';
import app from './app';
import { initSchema } from './db/schema';
import { SqliteProveedorRepository } from "./models/SQLite/SqliteProveedor";
import { SqliteProductoRepository } from "./models/SQLite/SqliteProducto";
import { SqliteVentaRepository } from "./models/SQLite/SqliteVenta";
import { ProductoService } from "./services/productoService";
import { VentaService } from "./services/ventaService";
import { ProveedorService } from "./services/proveedorService";
import { Proveedor } from './models/proveedor';
import { ProductoController } from './controllers/producto.controller';

const PORT = Number(process.env['PORT'] ?? 3000);

async function main(): Promise<void> {
  await initSchema();
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  const DB_PATH = "./dietetica.db";
  
  const repoProv = new SqliteProveedorRepository(DB_PATH);
  const repoProd = new SqliteProductoRepository(DB_PATH, repoProv);
  const repoVenta = new SqliteVentaRepository(DB_PATH, repoProd);

  const serviceProv = new ProveedorService(repoProv);
  const serviceProd = new ProductoService(repoProd, repoProv);
  const serviceVenta = new VentaService(repoVenta, repoProd);

  const productoController = new ProductoController(serviceProd);

  app.post("/productos/suelto", productoController.crearSuelto);
  app.post("/productos/envasado", productoController.crearEnvasado);
  app.get("/productos", productoController.listar);
  app.patch("/productos/:id/oferta", productoController.actualizarOferta);

}

main().catch((err) => {
  console.error('Startup error:', err);
  process.exit(1);
});

app.get('/health', (_req, res) => {
  res.json({ status: 'okis', timestamp: new Date() });
});

main();

export default app;