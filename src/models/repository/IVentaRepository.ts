import { Venta } from "../venta";

export interface IVentaRepository {
    save(venta: Venta): Promise<void>;
    findById(id: string): Promise<Venta | null>;
    findAll(): Promise<Venta[]>;
}