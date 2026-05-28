import { Producto } from "./producto";

export class ItemVenta {
    private readonly subtotal: number;

    private constructor(
        private readonly productoId: string,
        private readonly nombre: string,
        private readonly cantidad: number,
        private readonly precioUnitario: number,
        private readonly precioCompraUnitario: number,
        private readonly descuento: number
    ) {
        this.subtotal = ItemVenta.calcularSubtotal(cantidad, precioUnitario, descuento);
    }

    public static fromProducto(
        producto: Producto,
        cantidad: number,
        descuento: number = 0
    ): ItemVenta {
        const precioUnitario = producto.calcularPrecio(1);
        return new ItemVenta(
            producto.getId(),
            producto.getNombre(),
            cantidad,
            precioUnitario,
            producto.precioCompra,
            descuento
        );
    }

    public static fromHistorico(
        productoId: string,
        nombre: string,
        cantidad: number,
        precioUnitario: number,
        precioCompraUnitario: number,
        descuento: number,
        subtotal: number
    ): ItemVenta {
        const item = new ItemVenta(productoId, nombre, cantidad, precioUnitario, precioCompraUnitario, descuento);
        (item as any).subtotal = subtotal;
        return item;
    }

    private static calcularSubtotal(cantidad: number, precioUnitario: number, descuento: number): number {
        return cantidad * precioUnitario * (1 - descuento / 100);
    }

    public getProductoId(): string { return this.productoId; }
    public getNombre(): string { return this.nombre; }
    public getCantidad(): number { return this.cantidad; }
    public getPrecioUnitario(): number { return this.precioUnitario; }
    public getPrecioCompraUnitario(): number { return this.precioCompraUnitario; }
    public getDescuento(): number { return this.descuento; }
    public getSubtotal(): number { return this.subtotal; }
}
