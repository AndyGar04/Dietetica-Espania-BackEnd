import { Proveedor } from "./proveedor";

export abstract class Producto {

    constructor(
        public id: string,
        public proveedor: Proveedor,
        public nombre: string,
        public oferta: boolean,
        public cantidad: number
    ) {}

  
    public abstract calcularPrecio(
        cantidad: number
    ): number;


    public getId(): string {

        return this.id;
    }

    public getProveedor(): Proveedor {

        return this.proveedor;
    }

    public getNombre(): string {

        return this.nombre;
    }

    public isOferta(): boolean {

        return this.oferta;
    }

    public getCantidad(): number {

        return this.cantidad;
    }


    public setCantidad(
        cantidad: number
    ): void {

        this.cantidad = cantidad;
    }
}