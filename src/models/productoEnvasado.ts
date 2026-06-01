import { Producto } from "./producto";
import { Proveedor } from "./proveedor";

export class ProductoEnvasado extends Producto {

    public precioUnitario: number = 0;

    constructor(
        id: string,
        proveedor: Proveedor,
        nombre: string,
        oferta: boolean,
        precioVenta: number,
        cantidad: number,
        precioCompra: number,
        public fechaVencimiento: Date | null = null
    ) {
        super(
            id,
            proveedor,
            nombre,
            oferta,
            cantidad,
            precioCompra
        );

        // 🔥 IMPORTANTE: asignar precioVenta correctamente
        this.precioUnitario = precioVenta;
    }

    public override calcularPrecio(unidades: number): number {
        return unidades * this.precioUnitario;
    }

    public getPrecioUnitario(): number {
        return this.precioUnitario;
    }

    public setPrecioUnitario(precio: number): void {
        this.precioUnitario = precio;
    }
}