import { Producto } from "./producto";

export class ItemVenta {
    constructor(
        private producto: Producto,
        private cantidad: number
    ) {}

    public getSubtotal(): number {
        return this.producto.calcularPrecio(this.cantidad);
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