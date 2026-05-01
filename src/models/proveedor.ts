export class Proveedor {
    constructor(
        protected id: string,
        protected mail: string,
        protected nroTelefono: string
    ){}

    public getId(): string{
        return this.id 
    }

    public setId(id: string): void {
        this.id = id
    }

    public getMail(): string{
        return this.mail
    }

    public setMail(mail: string): void{
        this.mail = mail
    }

    public getNroTelefono(): string{
        return this.nroTelefono
    }

    public setNroTelefono(nroTelefono: string): void {
        this.nroTelefono = nroTelefono
    }
}