import { Categoria } from "../categoria";

export interface ICategoriaRepository {
    save(categoria: Categoria): Promise<void>;
    findById(id: string): Promise<Categoria | null>;
    findAll(): Promise<Categoria[]>;
    update(categoria: Categoria): Promise<void>;
    delete(id: string): Promise<void>;
}