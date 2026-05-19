import { Request, Response } from "express";
import { ProveedorService } from "../services/proveedorService";

export class ProveedorController {
  constructor(private proveedorService: ProveedorService) {}

  public registrar = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id, nombre, mail, nroTelefono } = req.body;

      if (!nombre || nombre.trim() === "") {
        return res.status(400).json({ error: "El nombre del proveedor es obligatorio" });
      }

      await this.proveedorService.registrarProveedor(
        id || "",
        nombre.trim(),
        mail || "",
        nroTelefono || ""
      );

      return res.status(201).json({ message: "Proveedor creado con éxito" });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  };

  public actualizar = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const { nombre, mail, nroTelefono } = req.body;

      if (!id || Array.isArray(id)) {
        return res.status(400).json({ error: "ID de proveedor requerido o inválido" });
      }

      if (!nombre || nombre.trim() === "") {
        return res.status(400).json({ error: "El nombre del proveedor es obligatorio" });
      }

      await this.proveedorService.actualizarProveedor(
        id,
        nombre.trim(),
        mail || "",
        nroTelefono || ""
      );

      return res.json({ message: "Proveedor actualizado con éxito" });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  };

  public listarTodos = async (_req: Request, res: Response): Promise<Response> => {
    try {
      const proveedores = await this.proveedorService.listarTodos();
      return res.json(proveedores);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  };

  public obtenerPorId = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      if (!id || Array.isArray(id)) {
        return res.status(400).json({ error: "ID de proveedor requerido o inválido" });
      }

      const proveedor = await this.proveedorService.obtenerPorId(id);
      if (!proveedor) {
        return res.status(404).json({ error: "Proveedor no encontrado" });
      }
      return res.json(proveedor);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  };

  public eliminar = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      if (!id || Array.isArray(id)) {
        return res.status(400).json({ error: "ID de proveedor requerido o inválido" });
      }

      await this.proveedorService.eliminarProveedor(id);
      return res.json({ message: "Proveedor eliminado físicamente con éxito" });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  };
}