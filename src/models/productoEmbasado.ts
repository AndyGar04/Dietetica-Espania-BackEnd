import { Producto } from "./producto";
import { Proveedor } from "./proveedor";

export class ProductoEnvasado extends Producto {
    constructor(
        id: string,
        proveedor: Proveedor,
        nombre: string,
        oferta: boolean,
        private precioUnitario: number
    ) {
        super(id, proveedor, nombre, oferta);
    }

    public override calcularPrecio(unidades: number): number {
        return unidades * this.precioUnitario;
    }

    // Getters y Setters
    public getPrecioUnitario(): number { 
        return this.precioUnitario; 
    }

    public setPrecioUnitario(precio: number): void { 
        this.precioUnitario = precio; 
    }
}