export class Categoria {
    constructor(
        public id: string,
        public nombre: string
    ) {}

    public getId(): string {
        return this.id;
    }

    public getNombre(): string {
        return this.nombre;
    }
}