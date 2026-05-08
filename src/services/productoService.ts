import { IProductoRepository } from "../models/repository/IProductoRepository";
import { IProveedorRepository } from "../models/repository/IProveedorRepository";
import { ProductoSuelto } from "../models/productoSuelto";
import { ProductoEnvasado } from "../models/productoEnvasado";
import { Producto } from "../models/producto";
import { Proveedor } from "../models/proveedor"; // Importación vital para evitar el error de getId()

export class ProductoService {
    constructor(
        private productoRepo: IProductoRepository,
        private proveedorRepo: IProveedorRepository
    ) {}

  
    public async actualizarProducto(
        id: string, 
        data: { nombre: string; precio: number; cantidad: number; oferta?: boolean; proveedorId: string; }
    ): Promise<void> {
        const producto = await this.productoRepo.findById(id);

        if (!producto) {
            throw new Error(`Producto con ID ${id} no encontrado`);
        }

        // Actualización de propiedades comunes (Setters o Directo)
        if (data.nombre) {
            if (typeof (producto as any).setNombre === 'function') (producto as any).setNombre(data.nombre);
            else (producto as any).nombre = data.nombre;
        }

        if (data.oferta !== undefined) {
            if (typeof (producto as any).setOferta === 'function') (producto as any).setOferta(data.oferta);
            else (producto as any).oferta = data.oferta;
        }

        // Lógica para detectar tipo de producto sin fallar por 'instanceof'
        if ('precioUnitario' in producto || (producto as any).precioUnitario !== undefined) {
            // Es Envasado
            if (typeof (producto as any).setPrecioUnitario === 'function') {
                (producto as any).setPrecioUnitario(data.precio);
            } else {
                (producto as any).precioUnitario = data.precio;
            }

            if (typeof (producto as any).setCantidad === 'function') {
                (producto as any).setCantidad(data.cantidad);
            } else {
                (producto as any).cantidad = data.cantidad;
            }
        } else {
            // Es Suelto
            if (typeof (producto as any).setPrecioPorGramo === 'function') {
                (producto as any).setPrecioPorGramo(data.precio);
            } else {
                (producto as any).precioPorGramo = data.precio;
            }
        }

        await this.productoRepo.update(producto);
    }


    public async crearProductoEnvasado(
        id: string,
        proveedorId: string,
        nombre: string,
        precioUnitario: number,
        cantidad: number,
        oferta: boolean = false
    ): Promise<void> {
        let proveedor = await this.proveedorRepo.findById(proveedorId);

        if (!proveedor) {
            console.log(`Proveedor ${proveedorId} no existe. Creando instancia real...`);
   
            const nuevoProv = new Proveedor(proveedorId, "Proveedor General", ""); 
            await (this.proveedorRepo as any).save(nuevoProv);
            proveedor = nuevoProv;
        }

        const nuevoEnvasado = new ProductoEnvasado(
            id || Date.now().toString(),
            proveedor!,
            nombre,
            oferta,
            precioUnitario,
            cantidad
        );

        await this.productoRepo.save(nuevoEnvasado);
    }


    public async crearProductoSuelto(
        id: string,
        proveedorId: string,
        nombre: string,
        precioPorGramo: number,
        oferta: boolean = false,
        cantidad: number 
    ): Promise<void> {
        let proveedor = await this.proveedorRepo.findById(proveedorId);

        if (!proveedor) {
            const nuevoProv = new Proveedor(proveedorId, "Proveedor General", "");
            await (this.proveedorRepo as any).save(nuevoProv);
            proveedor = nuevoProv;
        }

        const nuevoSuelto = new ProductoSuelto(
            id || Date.now().toString(),
            proveedor!,
            nombre,
            oferta,
            precioPorGramo
        );

        if (typeof (nuevoSuelto as any).setCantidad === 'function') {
            (nuevoSuelto as any).setCantidad(cantidad);
        }

        await this.productoRepo.save(nuevoSuelto);
    }


    public async listarCatalogo(): Promise<Producto[]> {
        return await this.productoRepo.findAll();
    }

    public async eliminarProducto(id: string): Promise<void> {
        const producto = await this.productoRepo.findById(id);
        if (!producto) throw new Error("Producto no encontrado");
        await this.productoRepo.delete(id);
    }

    public async cambiarEstadoOferta(id: string, estado: boolean): Promise<void> {
        const producto = await this.productoRepo.findById(id);
        if (!producto) throw new Error("No se encontró el producto");

        if (typeof (producto as any).setOferta === 'function') {
            (producto as any).setOferta(estado);
        } else {
            (producto as any).oferta = estado; 
        }
        await this.productoRepo.update(producto);
    }
}