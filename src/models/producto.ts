import { Proveedor } from "./proveedor";
import { Categoria } from "./categoria";

export abstract class Producto {

    public categoria: Categoria | null = null;

    constructor(
        public id: string,
        public proveedor: Proveedor,
        public nombre: string,
        public oferta: boolean,
        public cantidad: number
    ) {}

    public abstract calcularPrecio(cantidad: number): number;

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

    public setCantidad(cantidad: number): void {
        this.cantidad = cantidad;
    }
    
    public getCategoria(): Categoria | null {
        return this.categoria;
    }

    public setCategoria(categoria: Categoria | null): void {
        this.categoria = categoria;
    }
}