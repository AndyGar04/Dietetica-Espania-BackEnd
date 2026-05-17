import { Router } from "express";
import { CategoriaController } from "../controllers/categoria.controller";

export const crearCategoriaRouter = (categoriaController: CategoriaController): Router => {
    const router: Router = Router();

    router.post("/", categoriaController.crear);
    router.get("/", categoriaController.listar);
    router.put("/:id", categoriaController.actualizar);
    router.delete("/:id", categoriaController.eliminar);

    return router;
};