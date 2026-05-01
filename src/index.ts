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


  console.log("Arrancando el sistema de la Dietética");

    try {
        console.log("\n1. Registrando proveedor...");
        await serviceProv.registrarProveedor("P-001", "contacto@mayorista-bahia.com", "2914001122");

        console.log("2. Cargando productos...");
        await serviceProd.crearProductoSuelto("S-101", "P-001", "Ajo en Polvo", 0.85);
        await serviceProd.crearProductoEnvasado("E-202", "P-001", "Fideos Integrales 500g", 1250.00);

        console.log("3. Procesando una venta mixta...");
        const itemsParaVender = [
            { productoId: "S-101", cantidad: 150 },
            { productoId: "E-202", cantidad: 2 }
        ];

        const ventaRealizada = await serviceVenta.procesarVenta("V-777", itemsParaVender);

        console.log("\n VENTA EXITOSA ");
        console.log(`ID Venta: ${ventaRealizada.getId()}`);
        console.log(`Fecha: ${ventaRealizada.getFecha().toLocaleString()}`);
        console.log(`Total a cobrar: $${ventaRealizada.getTotalVenta()}`);

        const resumen = await serviceVenta.obtenerResumenVenta("V-777");
        console.log(`Resumen oficial: ${resumen}`);

    } catch (error) {
        console.error("\n❌ Error en la prueba:", error instanceof Error ? error.message : error);
    }
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