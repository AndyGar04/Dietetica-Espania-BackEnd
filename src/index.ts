import 'dotenv/config';
import app from './app';
import { initSchema } from './db/schema';

import { SqliteProveedorRepository } from "./models/SQLite/SqliteProveedor";
import { SqliteProductoRepository } from "./models/SQLite/SqliteProducto";
import { SqliteVentaRepository } from "./models/SQLite/SqliteVenta";

import { ProductoService } from "./services/productoService";
import { VentaService } from "./services/ventaService";
import { ProveedorService } from "./services/proveedorService";

import { ProductoController } from './controllers/producto.controller';
import { ProveedorController } from './controllers/proveedor.controller';
import { VentaController } from './controllers/venta.controller';

const PORT = Number(process.env['PORT'] ?? 3000);

async function main(): Promise<void> {
  await initSchema();

  const DB_PATH = "./dietetica.db";

  
  const repoProv = new SqliteProveedorRepository(DB_PATH);
  const repoProd = new SqliteProductoRepository(DB_PATH, repoProv);
  const repoVenta = new SqliteVentaRepository(DB_PATH, repoProd);

  
const serviceProv = new ProveedorService(repoProv);

// await serviceProv.registrarProveedor(
//   "1",
//   "proveedor@test.com",
//   "2910000000"
// );

console.log("Proveedor creado");

const serviceProd = new ProductoService(repoProd, repoProv);
  const serviceVenta = new VentaService(repoVenta, repoProd);


  const productoController = new ProductoController(serviceProd);
  const proveedorController = new ProveedorController(serviceProv);
  const ventaController = new VentaController(serviceVenta);

  

  app.post("/productos/suelto", productoController.crearSuelto);

  app.post("/productos/envasado", productoController.crearEnvasado);

  app.get("/productos", productoController.listar);

  app.patch(
    "/productos/:id/oferta",
    productoController.actualizarOferta
  );



  app.post("/proveedores", proveedorController.registrar);

  app.get("/proveedores", proveedorController.listarTodos);

  app.get("/proveedores/:id", proveedorController.obtenerPorId);

  app.put("/proveedores/:id", proveedorController.actualizar);

 

  app.post("/ventas", ventaController.registrarVenta);

  app.get("/ventas/:id/resumen", ventaController.obtenerResumen);



  app.get('/health', (_req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date(),
    });
  });



  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

main().catch((err) => {
  console.error('Startup error:', err);
  process.exit(1);
});

export default app;