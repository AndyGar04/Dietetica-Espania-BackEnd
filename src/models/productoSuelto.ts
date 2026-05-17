import { Producto } from "./producto";
import { Proveedor } from "./proveedor";

export class ProductoSuelto extends Producto {
    constructor(
        id: string,
        proveedor: Proveedor,
        nombre: string,
        oferta: boolean,
        cantidad: number,
        private precioPorGramo: number
    ) {
        super(id, proveedor, nombre, oferta, cantidad); 
    }

    public override calcularPrecio(gramos: number): number {
        return gramos * this.precioPorGramo;
    }

    public getPrecioPorGramo(): number { 
        return this.precioPorGramo; 
    }

    public setPrecioPorGramo(precio: number): void { 
        this.precioPorGramo = precio; 
    }
}