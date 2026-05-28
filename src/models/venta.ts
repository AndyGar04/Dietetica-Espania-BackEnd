import { randomUUID } from "crypto";
import { ItemVenta } from "./producto-venta";

export class Venta {
    private items: ItemVenta[] = [];

    constructor(
        private id: string = randomUUID(),
        private fecha: Date = new Date(),
        private metodoPago: string = 'efectivo'
    ) {}

    public agregarItem(item: ItemVenta): void {
        this.items.push(item);
    }

    public getTotalVenta(): number {
        return this.items.reduce((total, item) => total + item.getSubtotal(), 0);
    }

    public getId(): string {
        return this.id;
    }

    public getFecha(): Date {
        return this.fecha;
    }

    public getMetodoPago(): string {
        return this.metodoPago;
    }

    public getItems(): ItemVenta[] {
        return [...this.items];
    }
}
