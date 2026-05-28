import { Venta } from "../models/venta";
import { ItemVenta } from "../models/producto-venta";
import { IVentaRepository } from "../models/repository/IVentaRepository";
import { IProductoRepository } from "../models/repository/IProductoRepository";

export interface ItemVentaInput {
    productoId: string;
    cantidad: number;
    descuento?: number;
}

export interface ProcesarVentaInput {
    items: ItemVentaInput[];
    metodoPago: string;
}

export class VentaService {
    constructor(
        private ventaRepo: IVentaRepository,
        private productoRepo: IProductoRepository
    ) {}

    public async procesarVenta(input: ProcesarVentaInput): Promise<Venta> {
        const nuevaVenta = new Venta(undefined, undefined, input.metodoPago);

        for (const itemData of input.items) {
            const producto = await this.productoRepo.findById(itemData.productoId);
            if (!producto) {
                throw new Error(`El producto con ID ${itemData.productoId} no existe.`);
            }
            const item = ItemVenta.fromProducto(producto, itemData.cantidad, itemData.descuento ?? 0);
            nuevaVenta.agregarItem(item);
        }

        await this.ventaRepo.save(nuevaVenta);
        return nuevaVenta;
    }

    public async obtenerResumenVenta(id: string): Promise<string> {
        const venta = await this.ventaRepo.findById(id);
        if (!venta) throw new Error("Venta no encontrada.");

        return `Venta: ${venta.getId()} | Fecha: ${venta.getFecha().toLocaleDateString()} | Total: $${venta.getTotalVenta()}`;
    }

    public async obtenerVentas(input: { desde?: string | undefined; hasta?: string | undefined }): Promise<Venta[]> {
        const { desde, hasta } = input;

        if (desde && hasta && desde > hasta) {
            throw new Error('Rango de fechas inválido: desde no puede ser mayor que hasta.');
        }

        const desdeISO = desde ? `${desde}T00:00:00.000Z` : undefined;

        let hastaExclusivoISO: string | undefined;
        if (hasta) {
            const d = new Date(`${hasta}T00:00:00.000Z`);
            d.setUTCDate(d.getUTCDate() + 1);
            hastaExclusivoISO = d.toISOString();
        }

        return this.ventaRepo.findByDateRange(desdeISO, hastaExclusivoISO);
    }
}
