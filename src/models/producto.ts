import { Proveedor } from "./proveedor";
import { Categoria } from "./categoria";

export abstract class Producto {

    public categoria: Categoria | null = null;
    public fechaVencimiento: Date | null = null;

    // 🔥 IMPORTANTE: agregado para unificar frontend/backend
    public precioVenta: number = 0;

    constructor(
        public id: string,
        public proveedor: Proveedor,
        public nombre: string,
        public oferta: boolean,
        public cantidad: number,
        public precioCompra: number = 0,
        fechaVencimiento: Date | null = null,
        precioVenta: number = 0
    ) {
        this.fechaVencimiento = fechaVencimiento;
        this.precioVenta = precioVenta;
    }

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

    public getPrecioCompra(): number {
        return this.precioCompra;
    }

    public setPrecioCompra(precio: number): void {
        this.precioCompra = precio;
    }

    public getCategoria(): Categoria | null {
        return this.categoria;
    }

    public setCategoria(categoria: Categoria | null): void {
        this.categoria = categoria;
    }

  
    public setPrecioVenta(precio: number): void {
        this.precioVenta = precio;
    }

    public getPrecioVenta(): number {
        return this.precioVenta;
    }
}