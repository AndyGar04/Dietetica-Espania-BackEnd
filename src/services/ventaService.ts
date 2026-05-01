import { Venta } from "../models/venta";
import { ItemVenta } from "../models/producto-venta";
import { IVentaRepository } from "../models/repository/IVentaRepository";
import { IProductoRepository } from "../models/repository/IProductoRepository";

export class VentaService {
    constructor(
        private ventaRepo: IVentaRepository,
        private productoRepo: IProductoRepository
    ) {}

    public async procesarVenta(idVenta: string, itemsData: { productoId: string, cantidad: number }[]): Promise<Venta> {
        const nuevaVenta = new Venta(idVenta);

        for (const item of itemsData) {
            const producto = await this.productoRepo.findById(item.productoId);
            
            if (!producto) {
                throw new Error(`El producto con ID ${item.productoId} no existe.`);
            }

            const nuevoItem = new ItemVenta(producto, item.cantidad);
            
            nuevaVenta.agregarItem(nuevoItem);
        }

        await this.ventaRepo.save(nuevaVenta);
        
        return nuevaVenta;
    }

    public async obtenerResumenVenta(id: string): Promise<string> {
        const venta = await this.ventaRepo.findById(id);
        if (!venta) throw new Error("Venta no encontrada.");

        return `Venta: ${venta.getId()} | Fecha: ${venta.getFecha().toLocaleDateString()} | Total: $${venta.getTotalVenta()}`;
    }
}