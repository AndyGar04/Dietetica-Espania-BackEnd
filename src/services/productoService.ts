import { IProductoRepository } from "../models/repository/IProductoRepository";
import { IProveedorRepository } from "../models/repository/IProveedorRepository";
import { ProductoSuelto } from "../models/productoSuelto";
import { ProductoEnvasado } from "../models/productoEnvasado";
import { Producto } from "../models/producto";
import { Proveedor } from "../models/proveedor";

export class ProductoService {

    constructor(
        private productoRepo: IProductoRepository,
        private proveedorRepo: IProveedorRepository
    ) {}

    /* =====================================
        ACTUALIZAR PRODUCTO
    ===================================== */
    public async actualizarProducto(
        id: string,
        data: {
            nombre: string;
            precio?: number;
            precioCompra?: number;
            precioVenta?: number;
            cantidad: number;
            categoria?: string;
            proveedor?: string;
            oferta?: boolean;
            proveedorId: string;
        }
    ): Promise<void> {
        const producto = await this.productoRepo.findById(id);
        if (!producto) {
            throw new Error(`Producto con ID ${id} no encontrado`);
        }
        producto.nombre = data.nombre;
        producto.oferta = data.oferta || false;
        producto.cantidad = data.cantidad || 0;
        producto.precioCompra = data.precioCompra || 0;
        (producto as any).proveedorId = data.proveedorId || "1";
        (producto as any).precioVenta = data.precioVenta || 0;
        (producto as any).categoria = data.categoria || "";
        (producto as any).proveedorNombre = data.proveedor || "";

        if (producto instanceof ProductoEnvasado) {
            producto.precioUnitario = data.precioVenta || 0;
        }
        if (producto instanceof ProductoSuelto) {
            producto.setPrecioPorGramo(data.precioVenta || 0);
        }
        await this.productoRepo.update(producto);
    }

    /* =====================================
        CREAR ENVASADO (Todos obligatorios)
    ===================================== */
    public async crearProductoEnvasado(
        id: string,
        proveedorId: string,
        nombre: string,
        precioVenta: number,
        cantidad: number,
        oferta: boolean,
        precioCompra: number,
        categoria: string,
        proveedorNombre: string
    ): Promise<void> {
        let proveedor = await this.proveedorRepo.findById(proveedorId);
        if (!proveedor) {
            const nuevoProv = new Proveedor(proveedorId, "Proveedor General", "", "");
            await (this.proveedorRepo as any).save(nuevoProv);
            proveedor = nuevoProv;
        }

        const nuevoEnvasado = new ProductoEnvasado(
            id || Date.now().toString(),
            proveedor,
            nombre,
            oferta,
            precioVenta,
            cantidad,
            precioCompra
        );

        (nuevoEnvasado as any).precioVenta = precioVenta;
        (nuevoEnvasado as any).categoria = categoria;
        (nuevoEnvasado as any).proveedorNombre = proveedorNombre;
        (nuevoEnvasado as any).proveedorId = proveedorId;

        await this.productoRepo.save(nuevoEnvasado);
    }

    /* =====================================
        CREAR SUELTO (Todos obligatorios)
    ===================================== */
    public async crearProductoSuelto(
        id: string,
        proveedorId: string,
        nombre: string,
        precioVenta: number,
        oferta: boolean,
        cantidad: number,
        precioCompra: number,
        categoria: string,
        proveedorNombre: string
    ): Promise<void> {
        let proveedor = await this.proveedorRepo.findById(proveedorId);
        if (!proveedor) {
            const nuevoProv = new Proveedor(proveedorId, "Proveedor General", "", "");
            await (this.proveedorRepo as any).save(nuevoProv);
            proveedor = nuevoProv;
        }

        const nuevoSuelto = new ProductoSuelto(
            id || Date.now().toString(),
            proveedor,
            nombre,
            oferta,
            cantidad,
            precioVenta,
            precioCompra
        );

        (nuevoSuelto as any).precioVenta = precioVenta;
        (nuevoSuelto as any).categoria = categoria;
        (nuevoSuelto as any).proveedorNombre = proveedorNombre;
        (nuevoSuelto as any).proveedorId = proveedorId;

        await this.productoRepo.save(nuevoSuelto);
    }

    /* =====================================
        LISTAR / ELIMINAR / OFERTA
    ===================================== */
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
        producto.oferta = estado;
        await this.productoRepo.update(producto);
    }
}
