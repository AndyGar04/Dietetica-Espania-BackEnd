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

        const producto: any =
            await this.productoRepo.findById(id);

        if (!producto) {

            throw new Error(
                `Producto con ID ${id} no encontrado`
            );
        }

        producto.nombre =
            data.nombre;

        producto.oferta =
            data.oferta || false;

        producto.cantidad =
            data.cantidad || 0;

        producto.proveedorId =
            data.proveedorId || "1";

        producto.precioCompra =
            data.precioCompra || 0;

        producto.precioVenta =
            data.precioVenta || 0;

        producto.categoria =
            data.categoria || "";

        producto.proveedorNombre =
            data.proveedor || "";

        if (
            producto instanceof ProductoEnvasado
        ) {

            producto.precioUnitario =
                data.precioVenta || 0;
        }

       if (
    producto instanceof ProductoSuelto
) {

    producto.setPrecioPorGramo(
        data.precioVenta || 0
    );
}

        await this.productoRepo.update(
            producto
        );
    }

    /* =====================================
        CREAR ENVASADO
    ===================================== */

    public async crearProductoEnvasado(

        id: string,

        proveedorId: string,

        nombre: string,

        precioVenta: number,

        cantidad: number,

        oferta: boolean = false,

        precioCompra: number = 0,

        categoria: string = "",

        proveedorNombre: string = ""

    ): Promise<void> {

        let proveedor =
            await this.proveedorRepo.findById(
                proveedorId
            );

        if (!proveedor) {

            const nuevoProv =
                new Proveedor(

                    proveedorId,

                    "Proveedor General",

                    ""
                );

            await (this.proveedorRepo as any)
                .save(nuevoProv);

            proveedor = nuevoProv;
        }

        const nuevoEnvasado: any =
            new ProductoEnvasado(

                id || Date.now().toString(),

                proveedor,

                nombre,

                oferta,

                precioVenta,

                cantidad
            );

        nuevoEnvasado.precioCompra =
            precioCompra || 0;

        nuevoEnvasado.precioVenta =
            precioVenta || 0;

        nuevoEnvasado.categoria =
            categoria || "";

        nuevoEnvasado.proveedorNombre =
            proveedorNombre || "";

        nuevoEnvasado.proveedorId =
            proveedorId || "1";

        await this.productoRepo.save(
            nuevoEnvasado
        );
    }

    /* =====================================
        CREAR SUELTO
    ===================================== */

    public async crearProductoSuelto(

        id: string,

        proveedorId: string,

        nombre: string,

        precioVenta: number,

        oferta: boolean = false,

        cantidad: number,

        precioCompra: number = 0,

        categoria: string = "",

        proveedorNombre: string = ""

    ): Promise<void> {

        let proveedor =
            await this.proveedorRepo.findById(
                proveedorId
            );

        if (!proveedor) {

            const nuevoProv =
                new Proveedor(

                    proveedorId,

                    "Proveedor General",

                    ""
                );

            await (this.proveedorRepo as any)
                .save(nuevoProv);

            proveedor = nuevoProv;
        }

        const nuevoSuelto: any =
            new ProductoSuelto(
                id || Date.now().toString(),
                proveedor,
                nombre,
                oferta,
                cantidad || 0,
                precioVenta
            );

        nuevoSuelto.cantidad =
            cantidad || 0;

        nuevoSuelto.precioCompra =
            precioCompra || 0;

        nuevoSuelto.precioVenta =
            precioVenta || 0;

        nuevoSuelto.categoria =
            categoria || "";

        nuevoSuelto.proveedorNombre =
            proveedorNombre || "";

        nuevoSuelto.proveedorId =
            proveedorId || "1";

        await this.productoRepo.save(
            nuevoSuelto
        );
    }

    /* =====================================
        LISTAR
    ===================================== */

    public async listarCatalogo():
        Promise<Producto[]> {

        return await this.productoRepo
            .findAll();
    }

    /* =====================================
        ELIMINAR
    ===================================== */

    public async eliminarProducto(
        id: string
    ): Promise<void> {

        const producto =
            await this.productoRepo.findById(id);

        if (!producto) {

            throw new Error(
                "Producto no encontrado"
            );
        }

        await this.productoRepo.delete(id);
    }

    /* =====================================
        OFERTA
    ===================================== */

    public async cambiarEstadoOferta(

        id: string,

        estado: boolean

    ): Promise<void> {

        const producto: any =
            await this.productoRepo.findById(id);

        if (!producto) {

            throw new Error(
                "No se encontró el producto"
            );
        }

        producto.oferta = estado;

        await this.productoRepo.update(
            producto
        );
    }
}