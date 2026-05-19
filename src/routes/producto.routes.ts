import { Router } from "express";
import { ProductoController } from "../controllers/producto.controller";

export const crearProductoRouter = (productoController: ProductoController): Router => {
    const router: Router = Router();

    router.post("/suelto", productoController.registrarSuelto);
    router.post("/envasado", productoController.registrarEnvasado);
    router.get("/", productoController.listarTodos);
    router.patch("/:id/oferta", productoController.cambiarOferta);
    
    router.put("/:id", productoController.actualizar);
    router.delete("/:id", productoController.eliminar);

    return router;
};