import { Request, Response } from 'express';
import { ProductoService } from '../services/productoService';

export class ProductoController {
    constructor(private productoService: ProductoService) {}

    // POST /productos/suelto
    public crearSuelto = async (req: Request, res: Response) => {
        try {
            const { id, proveedorId, nombre, precioPorGramo, oferta } = req.body;

            // Llamada al método exacto del servicio
            await this.productoService.crearProductoSuelto(
                id, 
                proveedorId, 
                nombre, 
                precioPorGramo, 
                oferta
            );
            
            return res.status(201).json({ message: "Producto suelto registrado correctamente" });
        } catch (error: any) {
            return res.status(500).json({ error: error.message });
        }
    };

    // POST /productos/envasado
    public crearEnvasado = async (req: Request, res: Response) => {
        try {
            const { id, proveedorId, nombre, precioUnitario, oferta } = req.body;

            // Llamada al método exacto del servicio
            await this.productoService.crearProductoEnvasado(
                id, 
                proveedorId, 
                nombre, 
                precioUnitario, 
                oferta
            );

            return res.status(201).json({ message: "Producto envasado registrado correctamente" });
        } catch (error: any) {
            return res.status(500).json({ error: error.message });
        }
    };

    // GET /productos
    public listar = async (_req: Request, res: Response) => {
        try {
            // Usamos listarCatalogo() que definimos en el Service
            const productos = await this.productoService.listarCatalogo();
            
            // Formateamos la salida para el cliente
            const resultado = productos.map(p => ({
                id: p.getId(),
                nombre: p.getNombre(),
                proveedor: p.getProveedor().getId(), // Acceso al ID del proveedor
                oferta: p.isOferta()
            }));

            return res.json(resultado);
        } catch (error: any) {
            return res.status(500).json({ error: error.message });
        }
    };

    // PATCH /productos/:id/oferta
    public actualizarOferta = async (req: Request, res: Response) => {
        try {
            const id = req.params.id as string;
            const { estado } = req.body;

            // Llamada al método cambiarEstadoOferta()
            await this.productoService.cambiarEstadoOferta(id, estado);
            
            return res.json({ message: "El estado de la oferta ha sido actualizado" });
        } catch (error: any) {
            return res.status(500).json({ error: error.message });
        }
    };
}