export class Proveedor {
    constructor(
        public id: string,
        public nombre: string,
        public mail: string,
        public nroTelefono: string
    ) {}

    public getId(): string {
        return this.id;
    }

    public getNombre(): string {
        return this.nombre;
    }

    public getMail(): string {
        return this.mail;
    }

    public getNroTelefono(): string {
        return this.nroTelefono;
    }
}