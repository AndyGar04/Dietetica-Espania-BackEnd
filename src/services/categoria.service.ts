import { ICategoriaRepository } from "../models/repository/ICategoriaRepository";
import { Categoria } from "../models/categoria";

export class CategoriaService {
    constructor(private categoriaRepo: ICategoriaRepository) {}

    public async crearCategoria(id: string, nombre: string): Promise<void> {
        const idFinal = id || Date.now().toString();
        const nuevaCategoria = new Categoria(idFinal, nombre);
        await this.categoriaRepo.save(nuevaCategoria);
    }

    public async listarCategorias(): Promise<Categoria[]> {
        return await this.categoriaRepo.findAll();
    }

    public async actualizarCategoria(id: string, nombre: string): Promise<void> {
        const categoria = await this.categoriaRepo.findById(id);
        if (!categoria) throw new Error("La categoría no existe");
        
        categoria.nombre = nombre;
        await this.categoriaRepo.update(categoria);
    }

    public async eliminarCategoria(id: string): Promise<void> {
        const categoria = await this.categoriaRepo.findById(id);
        if (!categoria) throw new Error("La categoría no existe");
        
        await this.categoriaRepo.delete(id);
    }
}