import { Request, Response } from 'express';
import { VentaService } from '../services/ventaService';

export class VentaController {
    constructor(private ventaService: VentaService) {}

    // POST /ventas
    public registrarVenta = async (req: Request, res: Response) => {
        try {
            const { id, items } = req.body;

            // Validamos que el ID y el array de items existan
            if (!id || !items || !Array.isArray(items)) {
                return res.status(400).json({ 
                    error: "Se requiere un ID de venta y una lista de items válida." 
                });
            }

            // El servicio se encarga de buscar cada producto y calcular totales
            const venta = await this.ventaService.procesarVenta(id, items);

            return res.status(201).json({
                message: "Venta registrada con éxito",
                id: venta.getId(),
                total: venta.getTotalVenta(),
                fecha: venta.getFecha()
            });
        } catch (error: any) {
            // Si un producto no existe, el Service tira el error y acá lo capturamos[cite: 6]
            return res.status(500).json({ error: error.message });
        }
    };

    // GET /ventas/:id/resumen
    public obtenerResumen = async (req: Request, res: Response) => {
        try {
            // Usamos el 'as string' para que TS no chille con los tipos
            const id = req.params.id as string;

            // El servicio devuelve el string con el formato "Venta: ID | Fecha: ... | Total: ..."[cite: 6]
            const resumen = await this.ventaService.obtenerResumenVenta(id);

            return res.json({ resumen });
        } catch (error: any) {
            return res.status(404).json({ error: error.message });
        }
    };
}