import { Request, Response } from 'express';
import { ProveedorService } from '../services/proveedorService';

export class ProveedorController {
    constructor(private proveedorService: ProveedorService) {}

    // POST /proveedores
    public registrar = async (req: Request, res: Response) => {
        try {
            const { id, mail, nroTelefono } = req.body;

            // Validamos que no falte nada de lo que pide el modelo
            if (!id || !mail || !nroTelefono) {
                return res.status(400).json({ error: "Faltan datos obligatorios (id, mail o telefono)" });
            }

            await this.proveedorService.registrarProveedor(id, mail, nroTelefono);
            
            return res.status(201).json({ message: "Proveedor registrado con éxito" });
        } catch (error: any) {
            return res.status(500).json({ error: error.message });
        }
    };

    // GET /proveedores/:id
    public obtenerPorId = async (req: Request, res: Response) => {
        try {
            const id = req.params.id as string;
            
            const proveedor = await this.proveedorService.obtenerPorId(id);

            if (!proveedor) {
                return res.status(404).json({ error: "Proveedor no encontrado" });
            }

            // Devolvemos los datos del modelo
            return res.json({
                id: proveedor.getId(),
                mail: proveedor.getMail(),
                telefono: proveedor.getNroTelefono()
            });
        } catch (error: any) {
            return res.status(500).json({ error: error.message });
        }
    };

    // GET /proveedores
    public listarTodos = async (_req: Request, res: Response) => {
        try {
            const proveedores = await this.proveedorService.listarTodos();
            
            const resultado = proveedores.map(p => ({
                id: p.getId(),
                mail: p.getMail(),
                telefono: p.getNroTelefono()
            }));

            return res.json(resultado);
        } catch (error: any) {
            return res.status(500).json({ error: error.message });
        }
    };

    // PUT /proveedores/:id
    public actualizar = async (req: Request, res: Response) => {
        try {
            const id = req.params.id as string;
            const { mail, nroTelefono } = req.body;

            await this.proveedorService.actualizarContacto(id, mail, nroTelefono);
            
            return res.json({ message: "Datos de contacto actualizados correctamente" });
        } catch (error: any) {
            return res.status(500).json({ error: error.message });
        }
    };
}