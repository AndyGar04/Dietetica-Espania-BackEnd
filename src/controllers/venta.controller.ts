import { Request, Response } from 'express';
import { ZodError } from 'zod';
import { VentaService } from '../services/ventaService';
import { registrarVentaSchema, listarVentasQuerySchema } from '../validators/venta.validator';

export class VentaController {
    constructor(private ventaService: VentaService) {}

    // POST /ventas
    public registrarVenta = async (req: Request, res: Response) => {
        try {
            const data = registrarVentaSchema.parse(req.body);
            const venta = await this.ventaService.procesarVenta(data);

            return res.status(201).json({
                message: "Venta registrada con éxito",
                id: venta.getId(),
                total: venta.getTotalVenta(),
                fecha: venta.getFecha()
            });
        } catch (error: any) {
            if (error instanceof ZodError) {
                return res.status(400).json({ error: error.issues[0]?.message ?? 'Datos inválidos' });
            }
            const msg: string = error?.message ?? 'Error interno';
            if (msg.includes('Stock insuficiente') || msg.includes('no existe') || msg.includes('inexistente')) {
                return res.status(400).json({ error: msg });
            }
            return res.status(500).json({ error: msg });
        }
    };

    // GET /ventas?desde=YYYY-MM-DD&hasta=YYYY-MM-DD
    public listarVentas = async (req: Request, res: Response) => {
        try {
            const query = listarVentasQuerySchema.parse(req.query);
            const ventas = await this.ventaService.obtenerVentas(query);

            const payload = ventas.map(v => ({
                id: v.getId(),
                fecha: v.getFecha().toISOString(),
                total: v.getTotalVenta(),
                metodoPago: v.getMetodoPago(),
                items: v.getItems().map(i => ({
                    productoId: i.getProductoId(),
                    nombre: i.getNombre(),
                    cantidad: i.getCantidad(),
                    precioUnitario: i.getPrecioUnitario(),
                    precioCompraUnitario: i.getPrecioCompraUnitario(),
                    descuento: i.getDescuento(),
                    subtotal: i.getSubtotal(),
                })),
            }));

            return res.json(payload);
        } catch (error: any) {
            if (error instanceof ZodError) {
                return res.status(400).json({ error: error.issues[0]?.message ?? 'Parámetros inválidos' });
            }
            const msg: string = error?.message ?? 'Error interno';
            if (msg.includes('Rango de fechas inválido')) {
                return res.status(400).json({ error: msg });
            }
            return res.status(500).json({ error: msg });
        }
    };

    // GET /ventas/:id/resumen
    public obtenerResumen = async (req: Request, res: Response) => {
        try {
            const id = req.params.id as string;
            const resumen = await this.ventaService.obtenerResumenVenta(id);
            return res.json({ resumen });
        } catch (error: any) {
            return res.status(404).json({ error: error.message });
        }
    };
}
