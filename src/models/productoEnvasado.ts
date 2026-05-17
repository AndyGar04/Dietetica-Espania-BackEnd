import { Producto } from "./producto";
import { Proveedor } from "./proveedor";

export class ProductoEnvasado extends Producto {

    constructor(
        id: string,
        proveedor: Proveedor,
        nombre: string,
        oferta: boolean,
        public precioUnitario: number,
        cantidad: number
    ) {
        super(
            id, proveedor, nombre, oferta, cantidad
        );
    }

    public override calcularPrecio(
        unidades: number
    ): number {
        return unidades * this.precioUnitario;
    }

    public getPrecioUnitario(): number {
        return this.precioUnitario;
    }

    public setPrecioUnitario(
        precio: number
    ): void {
        this.precioUnitario = precio;
    }
}