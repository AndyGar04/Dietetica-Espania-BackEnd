import { Router } from "express";
import { ProveedorController } from "../controllers/proveedor.controller";

export const crearProveedorRouter = (proveedorController: ProveedorController): Router => {
    const router: Router = Router();

    router.post("/", proveedorController.registrar);
    router.get("/", proveedorController.listarTodos);
    router.get("/:id", proveedorController.obtenerPorId);
    router.put("/:id", proveedorController.actualizar);

    return router;
};