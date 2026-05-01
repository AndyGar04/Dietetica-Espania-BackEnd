import { Producto } from "../producto";

export interface IProductoRepository {
    save(producto: Producto): Promise<void>;
    findById(id: string): Promise<Producto | null>;
    findAll(): Promise<Producto[]>;
    update(producto: Producto): Promise<void>;
    delete(id: string): Promise<void>;
}