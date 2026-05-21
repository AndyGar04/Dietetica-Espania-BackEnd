import 'dotenv/config'; //
import app from './app'; //
import { initSchema } from './db/schema'; //

// Repositorios
import { SqliteProveedorRepository } from "./models/SQLite/SqliteProveedor"; //
import { SqliteProductoRepository } from "./models/SQLite/SqliteProducto"; //
import { SqliteVentaRepository } from "./models/SQLite/SqliteVenta"; //
import { SqliteCategoriaRepository } from "./models/SQLite/SqliteCategoria";

// Servicios
import { ProductoService } from "./services/productoService"; //
import { VentaService } from "./services/ventaService"; //
import { ProveedorService } from "./services/proveedorService"; //
import { CategoriaService } from "./services/categoria.service";

// Controladores
import { ProductoController } from './controllers/producto.controller'; //
import { ProveedorController } from './controllers/proveedor.controller'; //
import { VentaController } from './controllers/venta.controller'; //
import { CategoriaController } from './controllers/categoria.controller';

// Routers de la capa routes
import { crearProductoRouter } from './routes/producto.routes';
import { crearProveedorRouter } from './routes/proveedor.routes';
import { crearVentaRouter } from './routes/venta.routes';
import { crearCategoriaRouter } from './routes/categoria.routes';
import authRoutes from './routes/auth.routes';
import { authMiddleware } from './middlewares/auth.middleware';

const PORT = Number(process.env['PORT'] ?? 3000); 

async function main(): Promise<void> { 
  await initSchema(); 

  const DB_PATH = "./dietetica.db"; 

  const repoProv = new SqliteProveedorRepository(DB_PATH); 
  const repoCat = new SqliteCategoriaRepository(DB_PATH);
  const repoProd = new SqliteProductoRepository(DB_PATH); 
  const repoVenta = new SqliteVentaRepository(DB_PATH, repoProd); 

  const serviceProv = new ProveedorService(repoProv); 
  const serviceCat = new CategoriaService(repoCat);
  const serviceProd = new ProductoService(repoProd, repoProv); 
  const serviceVenta = new VentaService(repoVenta, repoProd); 

  const productoController = new ProductoController(serviceProd); 
  const proveedorController = new ProveedorController(serviceProv); 
  const ventaController = new VentaController(serviceVenta); 
  const categoriaController = new CategoriaController(serviceCat);

  app.use('/auth', authRoutes); 
  app.use('/productos', authMiddleware, crearProductoRouter(productoController));
  app.use('/proveedores', authMiddleware, crearProveedorRouter(proveedorController));
  app.use('/ventas', authMiddleware, crearVentaRouter(ventaController));
  app.use('/categorias', authMiddleware, crearCategoriaRouter(categoriaController));

  // Health check de rutina
  app.get('/health', (_req, res) => { 
    res.json({ status: 'ok', timestamp: new Date() }); 
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