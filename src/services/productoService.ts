import { IProductoRepository } from "../models/repository/IProductoRepository";
import { IProveedorRepository } from "../models/repository/IProveedorRepository";
import { ProductoSuelto } from "../models/productoSuelto";
import { ProductoEnvasado } from "../models/productoEnvasado";
import { Producto } from "../models/producto";

export class ProductoService {
    constructor(
        private productoRepo: IProductoRepository,
        private proveedorRepo: IProveedorRepository
    ) {}

    public async crearProductoSuelto(
        id: string, 
        proveedorId: string, 
        nombre: string, 
        precioPorGramo: number,
        oferta: boolean = false
    ): Promise<void> {
        // Buscamos al proveedor por ID
        const proveedor = await this.proveedorRepo.findById(proveedorId);
        if (!proveedor) throw new Error("El proveedor no existe."); 

        const nuevoSuelto = new ProductoSuelto(id, proveedor, nombre, oferta, precioPorGramo);
        await this.productoRepo.save(nuevoSuelto);
    }

    public async crearProductoEnvasado(
        id: string, 
        proveedorId: string, 
        nombre: string, 
        precioUnitario: number,
        oferta: boolean = false
    ): Promise<void> {
        const proveedor = await this.proveedorRepo.findById(proveedorId);
        if (!proveedor) throw new Error("El proveedor no existe."); 

        const nuevoEnvasado = new ProductoEnvasado(id, proveedor, nombre, oferta, precioUnitario);
        await this.productoRepo.save(nuevoEnvasado);
    }

    public async listarCatalogo(): Promise<Producto[]> {
        return await this.productoRepo.findAll();
    }

    public async cambiarEstadoOferta(id: string, estado: boolean): Promise<void> {
        const producto = await this.productoRepo.findById(id);
        
        if (!producto) {
            throw new Error("No se encontró el producto para actualizar la oferta.");
        }

        producto.setOferta(estado);
        await this.productoRepo.update(producto);
    }
}