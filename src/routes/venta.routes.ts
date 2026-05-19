import { Router } from "express";
import { VentaController } from "../controllers/venta.controller";

export const crearVentaRouter = (ventaController: VentaController): Router => {
    const router: Router = Router();

    router.post("/", ventaController.registrarVenta);
    router.get("/:id/resumen", ventaController.obtenerResumen);

    return router;
};