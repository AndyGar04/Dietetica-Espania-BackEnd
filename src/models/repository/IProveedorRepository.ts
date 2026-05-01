import { Proveedor } from "../proveedor";

export interface IProveedorRepository {
    save(proveedor: Proveedor): Promise<void>;
    findById(id: string): Promise<Proveedor | null>;
    findAll(): Promise<Proveedor[]>;
    update(proveedor: Proveedor): Promise<void>;
    delete(id: string): Promise<void>;
}