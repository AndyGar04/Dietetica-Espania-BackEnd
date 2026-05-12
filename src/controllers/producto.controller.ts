import { Request, Response } from "express";
import { ProductoService } from "../services/productoService";

export class ProductoController {

  constructor(
    private productoService: ProductoService
  ) {}

  /* =====================================
      CREAR PRODUCTO ENVASADO
  ===================================== */

  public crearEnvasado = async (
    req: Request,
    res: Response
  ): Promise<Response> => {

    try {

      const {
        id,
        proveedorId,

        nombre,

        precioCompra,
        precioVenta,

        categoria,
        proveedor,

        cantidad,
        oferta,
      } = req.body;

      await this.productoService.crearProductoEnvasado(
        id,
        proveedorId || "1",

        nombre,

        Number(precioVenta),

        Number(cantidad),

        oferta ?? false
      );

      return res.status(201).json({
        message:
          "Producto creado correctamente",
      });

    } catch (error: any) {

      console.error(error);

      return res.status(500).json({
        error:
          error.message,
      });
    }
  };

  /* =====================================
      CREAR PRODUCTO SUELTO
  ===================================== */

  public crearSuelto = async (
    req: Request,
    res: Response
  ): Promise<Response> => {

    try {

      const {
        id,
        proveedorId,

        nombre,

        precioCompra,
        precioVenta,

        categoria,
        proveedor,

        cantidad,
        oferta,
      } = req.body;

      await this.productoService.crearProductoSuelto(
        id,
        proveedorId || "1",

        nombre,

        Number(precioVenta),

        oferta ?? false,

        Number(cantidad)
      );

      return res.status(201).json({
        message:
          "Producto suelto creado correctamente",
      });

    } catch (error: any) {

      console.error(error);

      return res.status(500).json({
        error:
          error.message,
      });
    }
  };

  /* =====================================
      LISTAR PRODUCTOS
  ===================================== */

  public listar = async (
    _req: Request,
    res: Response
  ): Promise<Response> => {

    try {

      const productos =
        await this.productoService
          .listarCatalogo();

      const resultado =
        productos.map((p: any) => {

          const esEnvasado =
            typeof p.getPrecioUnitario ===
            "function";

          return {

            id:
              typeof p.getId === "function"
                ? p.getId()
                : p.id,

            nombre:
              typeof p.getNombre === "function"
                ? p.getNombre()
                : p.nombre,

            cantidad:
              typeof p.getCantidad === "function"
                ? Number(
                    p.getCantidad()
                  )
                : Number(
                    p.cantidad || 0
                  ),

            oferta:
              typeof p.isOferta === "function"
                ? p.isOferta()
                : Boolean(
                    p.oferta
                  ),

            proveedorId:
              typeof p.getProveedor ===
              "function"
                ? (
                    p.getProveedor()?.getId?.()
                  ) || "1"
                : p.proveedorId || "1",

            proveedor:
              p.proveedorNombre ||
              p.proveedor ||
              "",

            categoria:
              p.categoria || "",

            precioCompra:
              Number(
                p.precioCompra || 0
              ),

            precioVenta:
              esEnvasado
                ? Number(
                    p.getPrecioUnitario?.() ||
                    p.precioVenta ||
                    0
                  )
                : Number(
                    p.getPrecioPorGramo?.() ||
                    p.precioVenta ||
                    0
                  ),

            precio:
              esEnvasado
                ? Number(
                    p.getPrecioUnitario?.() ||
                    0
                  )
                : Number(
                    p.getPrecioPorGramo?.() ||
                    0
                  ),

            ganancia:
              Number(
                (
                  (
                    p.precioVenta ||
                    p.getPrecioUnitario?.() ||
                    0
                  ) -
                  (
                    p.precioCompra ||
                    0
                  )
                )
              ),

            tipo:
              esEnvasado
                ? "Envasado"
                : "Suelto",
          };
        });

      return res.json(
        resultado
      );

    } catch (error: any) {

      console.error(error);

      return res.status(500).json({
        error:
          error.message,
      });
    }
  };

  /* =====================================
      ACTUALIZAR PRODUCTO
  ===================================== */

  public actualizar = async (
    req: Request,
    res: Response
  ): Promise<Response> => {

    try {

      const id =
        Array.isArray(
          req.params.id
        )
          ? req.params.id[0]
          : req.params.id;

      const {

        nombre,

        precioCompra,
        precioVenta,

        cantidad,

        categoria,
        proveedor,

        oferta,

        proveedorId,

      } = req.body;

      if (!id) {

        return res.status(400).json({
          error:
            "ID de producto requerido",
        });
      }

      await this.productoService
        .actualizarProducto(
          id,
          {
            id,

            nombre,

            precioCompra:
              Number(
                precioCompra
              ),

            precioVenta:
              Number(
                precioVenta
              ),

            cantidad:
              Number(
                cantidad
              ),

            categoria:
              categoria || "",

            proveedor:
              proveedor || "",

            oferta,

            proveedorId:
              proveedorId || "1",
          }
        );

      return res.json({
        message:
          "Producto actualizado correctamente",
      });

    } catch (error: any) {

      console.error(
        "Error al actualizar producto:",
        error
      );

      return res.status(500).json({
        error:
          error.message,
      });
    }
  };

  /* =====================================
      ACTUALIZAR OFERTA
  ===================================== */

  public actualizarOferta = async (
    req: Request,
    res: Response
  ): Promise<Response> => {

    try {

      const id =
        Array.isArray(
          req.params.id
        )
          ? req.params.id[0]
          : req.params.id;

      const { estado } =
        req.body;

      if (!id) {

        return res.status(400).json({
          error:
            "ID inválido",
        });
      }

      await this.productoService
        .cambiarEstadoOferta(
          id,
          estado
        );

      return res.json({
        message:
          "Oferta actualizada",
      });

    } catch (error: any) {

      console.error(error);

      return res.status(500).json({
        error:
          error.message,
      });
    }
  };

  /* =====================================
      ELIMINAR
  ===================================== */

  public eliminar = async (
    req: Request,
    res: Response
  ): Promise<Response> => {

    try {

      const id =
        Array.isArray(
          req.params.id
        )
          ? req.params.id[0]
          : req.params.id;

      if (!id) {

        return res.status(400).json({
          error:
            "ID inválido",
        });
      }

      await this.productoService
        .eliminarProducto(
          id
        );

      return res.json({
        message:
          "Producto eliminado correctamente",
      });

    } catch (error: any) {

      console.error(error);

      return res.status(500).json({
        error:
          error.message,
      });
    }
  };
}