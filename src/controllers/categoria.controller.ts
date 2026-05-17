import { Request, Response } from "express";
import { CategoriaService } from "../services/categoria.service"

export class CategoriaController {
    constructor(private categoriaService: CategoriaService) {}

    public crear = async (req: Request, res: Response): Promise<Response> => {
        try {
            const { id, nombre } = req.body;
            if (!nombre?.trim()) {
                return res.status(400).json({ error: "El nombre es requerido" });
            }
            await this.categoriaService.crearCategoria(id, nombre.trim());
            return res.status(201).json({ message: "Categoría creada perfectamente" });
        } catch (error: any) {
            return res.status(500).json({ error: error.message });
        }
    };

    public listar = async (_req: Request, res: Response): Promise<Response> => {
        try {
            const categorias = await this.categoriaService.listarCategorias();
            return res.json(categorias);
        } catch (error: any) {
            return res.status(500).json({ error: error.message });
        }
    };

    public actualizar = async (req: Request, res: Response): Promise<Response> => {
        try {
            const { id } = req.params;
            const { nombre } = req.body;

            if (!id || Array.isArray(id)) {
                return res.status(400).json({ error: "ID de categoría requerido o inválido" });
            }
            if (!nombre?.trim()) {
                return res.status(400).json({ error: "El nombre modificado es requerido" });
            }

            await this.categoriaService.actualizarCategoria(id, nombre.trim());
            return res.json({ message: "Categoría actualizada correctamente" });
        } catch (error: any) {
            return res.status(500).json({ error: error.message });
        }
    };

    public eliminar = async (req: Request, res: Response): Promise<Response> => {
        try {
            const { id } = req.params;
            if (!id || Array.isArray(id)) {
                return res.status(400).json({ error: "ID requerido o inválido" });
            }

            await this.categoriaService.eliminarCategoria(id);
            return res.json({ message: "Categoría eliminada" });
        } catch (error: any) {
            return res.status(500).json({ error: error.message });
        }
    };
}