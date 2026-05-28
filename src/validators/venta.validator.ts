import { z } from 'zod';

export const registrarVentaSchema = z.object({
  items: z
    .array(
      z.object({
        productoId: z.string().min(1, 'productoId es requerido'),
        cantidad: z.number().positive('cantidad debe ser mayor a 0'),
        descuento: z.number().min(0).max(100).optional().default(0),
      })
    )
    .min(1, 'Se requiere al menos un item'),
  metodoPago: z.enum(['efectivo', 'debito', 'credito', 'transferencia']).default('efectivo'),
});

export type RegistrarVentaInput = z.infer<typeof registrarVentaSchema>;
