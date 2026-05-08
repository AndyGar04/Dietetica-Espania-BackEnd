import { Request, Response } from "express";
import { ProductoService } from "../services/productoService";

export class ProductoController {

  constructor(
    private productoService: ProductoService
  ) {}

  // =========================
  // CREAR ENVASADO
  // =========================
  public crearEnvasado = async (
    req: Request,
    res: Response
  ): Promise<Response> => {

    try {

      const {
        id,
        proveedorId,
        nombre,
        precioUnitario,
        cantidad,
        oferta,
      } = req.body;

      await this.productoService.crearProductoEnvasado(
        id,
        proveedorId,
        nombre,
        Number(precioUnitario),
        Number(cantidad),
        oferta ?? false
      );

      return res.status(201).json({
        message:
          "Producto envasado creado correctamente",
      });

    } catch (error: any) {

      console.error(error);

      return res.status(500).json({
        error: error.message,
      });
    }
  };

  // =========================
  // CREAR SUELTO
  // =========================
  public crearSuelto = async (
    req: Request,
    res: Response
  ): Promise<Response> => {

    try {

      const {
        id,
        proveedorId,
        nombre,
        precioPorGramo,
        cantidad,
        oferta,
      } = req.body;

      await this.productoService.crearProductoSuelto(
        id,
        proveedorId,
        nombre,
        Number(precioPorGramo),
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
        error: error.message,
      });
    }
  };

  // =========================
  // LISTAR PRODUCTOS
  // =========================
  public listar = async (
    _req: Request,
    res: Response
  ): Promise<Response> => {

    try {

      const productos =
        await this.productoService.listarCatalogo();

      const resultado = productos.map((p: any) => {

        const esEnvasado =
          typeof p.getPrecioUnitario === "function";

        return {

          // =========================
          // DATOS BASE
          // =========================
          id: p.getId(),

          nombre: p.getNombre(),

          cantidad:
            typeof p.getCantidad === "function"
              ? Number(p.getCantidad())
              : 0,

          oferta:
            typeof p.isOferta === "function"
              ? p.isOferta()
              : false,

          proveedor:
            typeof p.getProveedor === "function"
              ? {
                  id:
                    p.getProveedor()?.getId?.() ||
                    null,
                }
              : null,

          // =========================
          // PRECIOS
          // =========================
          precioUnitario: esEnvasado
            ? Number(
                p.getPrecioUnitario?.() || 0
              )
            : null,

          precioPorGramo:
            !esEnvasado &&
            typeof p.getPrecioPorGramo ===
              "function"
              ? Number(
                  p.getPrecioPorGramo?.() || 0
                )
              : null,

          // =========================
          // COMPATIBILIDAD FRONTEND
          // =========================
          precio: esEnvasado
            ? Number(
                p.getPrecioUnitario?.() || 0
              )
            : Number(
                p.getPrecioPorGramo?.() || 0
              ),

          tipo: esEnvasado
            ? "Envasado"
            : "Suelto",
        };
      });

      return res.json(resultado);

    } catch (error: any) {

      console.error(error);

      return res.status(500).json({
        error: error.message,
      });
    }
  };

  // =========================
  // ACTUALIZAR PRODUCTO
  // =========================
  public actualizar = async (
    req: Request,
    res: Response
  ): Promise<Response> => {

    try {

      const id = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;

      const {
        nombre,
        precio,
        cantidad,
        oferta,
        proveedorId
      } = req.body;

      if (!id) {

        return res.status(400).json({
          error:
            "ID de producto requerido",
        });
      }

      await this.productoService.actualizarProducto(
        id,
        {
          nombre,
          precio: Number(precio),
          cantidad: Number(cantidad),
          oferta,
          proveedorId
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
        error: error.message,
      });
    }
  };

  // =========================
  // ACTUALIZAR OFERTA
  // =========================
  public actualizarOferta = async (
    req: Request,
    res: Response
  ): Promise<Response> => {

    try {

      const id = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;

      const { estado } = req.body;

      if (!id) {

        return res.status(400).json({
          error: "ID inválido",
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
        error: error.message,
      });
    }
  };

  // =========================
  // ELIMINAR PRODUCTO
  // =========================
  public eliminar = async (
    req: Request,
    res: Response
  ): Promise<Response> => {

    try {

      const id = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;

      if (!id) {

        return res.status(400).json({
          error: "ID inválido",
        });
      }

      await this.productoService
        .eliminarProducto(id);

      return res.json({
        message:
          "Producto eliminado correctamente",
      });

    } catch (error: any) {

      console.error(error);

      return res.status(500).json({
        error: error.message,
      });
    }
  };
}