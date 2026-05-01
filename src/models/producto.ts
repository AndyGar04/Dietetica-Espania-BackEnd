import { Proveedor } from "./proveedor";

export abstract class Producto {
    constructor(
        protected id: string,
        protected proveedor: Proveedor,
        protected nombre: string,
        protected oferta: boolean
    ) {}

    // Despues creo modelos que faltan
    public abstract calcularPrecio(cantidad: number): number;

    // Getters y Setters 
    public getId(): string { 
        return this.id; 
    }

    public setId(id: string): void { 
        this.id = id; 
    }

    public getProveedor(): Proveedor {
        return this.proveedor;
    }
    
    public setProveedor(proveedor: Proveedor): void {
        this.proveedor = proveedor;
    }

    public getNombre(): string { 
        return this.nombre; 
    }

    public setNombre(nombre: string): void { 
        this.nombre = nombre; 
    }

    public isOferta(): boolean { 
        return this.oferta; 
    }

    public setOferta(oferta: boolean): void { 
        this.oferta = oferta; 
    }
}