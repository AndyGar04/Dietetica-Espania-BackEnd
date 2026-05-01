import { Producto } from "./producto";
import { Proveedor } from "./proveedor";

export class ProductoSuelto extends Producto {
    constructor(
        id: string,
        proveedor: Proveedor,
        nombre: string,
        oferta: boolean,
        private precioPorGramo: number
    ) {
        super(id, proveedor, nombre, oferta);
    }

    public override calcularPrecio(gramos: number): number {
        return gramos * this.precioPorGramo;
    }

    // Getters y Setters 
    public getPrecioPorGramo(): number { 
        return this.precioPorGramo; 
    }

    public setPrecioPorGramo(precio: number): void { 
        this.precioPorGramo = precio; 
    }
}