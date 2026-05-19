import { Request, Response } from "express";
import { ProductoService } from "../services/productoService";

export class ProductoController {
  constructor(private productoService: ProductoService) {}

  public registrarEnvasado = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id, nombre, precioCompra, precioVenta, precioUnitario, cantidad, categoria, categoriaId, proveedorId, oferta } = req.body;

      const precioFinal = Number(precioVenta || precioUnitario || 0);
      const catId = String(categoriaId || categoria || "");

      if (!nombre || precioFinal <= 0 || !proveedorId || !catId) {
        return res.status(400).json({ error: "Faltan campos obligatorios para el producto envasado." });
      }

      await this.productoService.crearProductoEnvasado(
        id || crypto.randomUUID(),
        String(proveedorId),
        nombre.trim(),
        precioFinal,
        Number(cantidad || 0),
        Boolean(oferta),
        Number(precioCompra || 0),
        catId,
        ""
      );

      return res.status(201).json({ message: "Producto envasado creado con éxito" });
    } catch (error: any) {
      console.error("Error en registrarEnvasado:", error);
      return res.status(500).json({ error: error.message });
    }
  };

  public registrarSuelto = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id, nombre, precioCompra, precioVenta, precioPorGramo, cantidad, categoria, categoriaId, proveedorId, oferta } = req.body;

      const precioFinal = Number(precioVenta || precioPorGramo || 0);
      const catId = String(categoriaId || categoria || "");

      if (!nombre || precioFinal <= 0 || !proveedorId || !catId) {
        return res.status(400).json({ error: "Faltan campos obligatorios para el producto suelto." });
      }

      await this.productoService.crearProductoSuelto(
        id || crypto.randomUUID(),
        String(proveedorId),
        nombre.trim(),
        precioFinal,
        Boolean(oferta),
        Number(cantidad || 0),
        Number(precioCompra || 0),
        catId,
        ""
      );

      return res.status(201).json({ message: "Producto suelto creado con éxito" });
    } catch (error: any) {
      console.error("Error en registrarSuelto:", error);
      return res.status(500).json({ error: error.message });
    }
  };

  public listarTodos = async (_req: Request, res: Response): Promise<Response> => {
    try {
      const productos = await this.productoService.listarCatalogo();
      return res.json(productos);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  };

  public actualizar = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const { nombre, precioCompra, precioVenta, cantidad, categoria, categoriaId, proveedorId, oferta } = req.body;
      
      if (!id || Array.isArray(id)) {
        return res.status(400).json({ error: "ID de producto requerido o inválido" });
      }

      const catId = String(categoriaId || categoria || "");

      await this.productoService.actualizarProducto(id, {
        nombre: nombre || "",
        precioCompra: Number(precioCompra || 0),
        precioVenta: Number(precioVenta || 0),
        cantidad: Number(cantidad || 0),
        proveedorId: String(proveedorId || ""),
        categoria: String(categoriaId || ""),
        oferta: Boolean(oferta)
      });

      return res.json({ message: "Producto actualizado con éxito" });
    } catch (error: any) {
      console.error("Error crítico al actualizar producto:", error);
      return res.status(400).json({ error: error.message });
    }
  };

  public eliminar = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      if (!id || Array.isArray(id)) {
        return res.status(400).json({ error: "ID de producto requerido o inválido" });
      }

      await this.productoService.eliminarProducto(id);
      return res.json({ message: "Producto eliminado con éxito" });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  };

  public cambiarOferta = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const { estado } = req.body;

      if (!id || Array.isArray(id)) {
        return res.status(400).json({ error: "ID de producto requerido o inválido" });
      }

      await this.productoService.cambiarEstadoOferta(id, Boolean(estado));
      return res.json({ message: "Estado de oferta actualizado con éxito" });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  };
}