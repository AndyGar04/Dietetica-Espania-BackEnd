import { Producto } from "./producto";

export class ItemVenta {
    private precioUnitario: number;
    private subtotal: number;

    constructor(
        private producto: Producto,
        private cantidad: number
    ) {
        this.precioUnitario = producto.calcularPrecio(1);
        this.subtotal = producto.calcularPrecio(cantidad);
    }

    public static fromHistorico(
        producto: Producto,
        cantidad: number,
        precioUnitario: number,
        subtotal: number
    ): ItemVenta {
        const item = new ItemVenta(producto, cantidad);
        item.precioUnitario = precioUnitario;
        item.subtotal = subtotal;
        return item;
    }

    public getSubtotal(): number {
        return this.subtotal;
    }

    public getPrecioUnitario(): number {
        return this.precioUnitario;
    }

    // Getters y Setters
    public getProducto(): Producto {
        return this.producto;
    }

    public setProducto(p: Producto): void {
        this.producto = p;
    }

    public getCantidad(): number {
        return this.cantidad;
    }

    public setCantidad(c: number): void {
        this.cantidad = c;
    }
}
