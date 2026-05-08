import { Router } from 'express';
import { ProductoController } from '../controllers/producto.controller';
import { ProductoService } from '../services/productoService';
import { SqliteProductoRepository } from '../models/SQLite/SqliteProducto';
import { SqliteProveedorRepository } from '../models/SQLite/SqliteProveedor';

const router = Router();


const dbPath = './dietetica.db'; 

const proveedorRepo = new SqliteProveedorRepository(dbPath);
const productoRepo = new SqliteProductoRepository(dbPath, proveedorRepo);
const productoService = new ProductoService(productoRepo, proveedorRepo);
const productoController = new ProductoController(productoService);

// Definición de Endpoints
router.get('/', (req, res) => productoController.listar(req, res));
router.post('/envasado', (req, res) => productoController.crearEnvasado(req, res));
router.post('/suelto', (req, res) => productoController.crearSuelto(req, res));
router.put('/:id', (req, res) => productoController.actualizar(req, res));
router.put('/oferta/:id', (req, res) => productoController.actualizarOferta(req, res));
router.delete('/:id', (req, res) => productoController.eliminar(req, res));

export default router;