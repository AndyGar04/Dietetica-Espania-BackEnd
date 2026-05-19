import { Proveedor } from "../models/proveedor";

export class ProveedorService {
    constructor(private repoProv: any) {}

    public async registrarProveedor(id: string, nombre: string, mail: string, nroTelefono: string): Promise<void> {
        if (!nombre || nombre.trim() === "") {
            throw new Error("El nombre del proveedor es obligatorio.");
        }

        const idFinal = id && id.trim() !== "" ? id : Date.now().toString();
        const mailLimpio = mail ? mail.trim() : "";
        const telLimpio = nroTelefono ? nroTelefono.trim() : "";

        if (mailLimpio.length > 0) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(mailLimpio)) {
                throw new Error("El formato del mail es inválido.");
            }
        }

        const nuevo = new Proveedor(idFinal, nombre.trim(), mailLimpio, telLimpio);
        await this.repoProv.save(nuevo);
    }

    public async actualizarProveedor(id: string, nombre: string, mail: string, nroTelefono: string): Promise<void> {
        if (!id) throw new Error("ID requerido.");
        if (!nombre || nombre.trim() === "") {
            throw new Error("El nombre del proveedor es obligatorio.");
        }

        const mailLimpio = mail ? mail.trim() : "";
        const telLimpio = nroTelefono ? nroTelefono.trim() : "";

        if (mailLimpio.length > 0) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(mailLimpio)) {
                throw new Error("El formato del mail es inválido.");
            }
        }

        const editado = new Proveedor(id, nombre.trim(), mailLimpio, telLimpio);
        await this.repoProv.update(editado);
    }

    public async listarTodos(): Promise<Proveedor[]> {
        return await this.repoProv.findAll();
    }

    public async obtenerPorId(id: string): Promise<Proveedor | null> {
        return await this.repoProv.findById(id);
    }

    public async eliminarProveedor(id: string): Promise<void> {
        if (!id) throw new Error("ID requerido.");
        await this.repoProv.delete(id);
    }
}