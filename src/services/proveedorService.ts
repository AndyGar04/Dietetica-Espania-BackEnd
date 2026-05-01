import { Proveedor } from "../models/proveedor";
import { IProveedorRepository } from "../models/repository/IProveedorRepository";

export class ProveedorService {
    constructor(private repo: IProveedorRepository) {}

    public async registrarProveedor(id: string, mail: string, tel: string): Promise<void> {
        if (!mail.includes("@")) {
            throw new Error("El formato del mail es inválido.");
        }

        const existe = await this.repo.findById(id);
        if (existe) {
            throw new Error("Ya existe un proveedor con ese ID.");
        }

        const nuevoProveedor = new Proveedor(id, mail, tel);
        await this.repo.save(nuevoProveedor);
        
        console.log(`Proveedor ${id} registrado con éxito.`);
    }

    public async listarTodos(): Promise<Proveedor[]> {
        return await this.repo.findAll();
    }

    public async obtenerPorId(id: string): Promise<Proveedor | null> {
        return await this.repo.findById(id);
    }

    public async actualizarContacto(id: string, nuevoMail: string, nuevoTel: string): Promise<void> {
        const proveedor = await this.repo.findById(id);
        if (!proveedor) throw new Error("Proveedor no encontrado.");

        proveedor.setMail(nuevoMail);
        proveedor.setNroTelefono(nuevoTel);

        await this.repo.update(proveedor);
    }
}