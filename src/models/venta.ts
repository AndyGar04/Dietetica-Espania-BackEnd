import { ItemVenta } from "./producto-venta";

export class Venta {
    private items: ItemVenta[] = [];

    constructor(
        private id: string,
        private fecha: Date = new Date()
    ) {}

    public agregarItem(item: ItemVenta): void {
        this.items.push(item);
    }

    public getTotalVenta(): number {
        return this.items.reduce((total, item) => total + item.getSubtotal(), 0);
    }

    // Getters y Setters
    public getId(): string { 
        return this.id; 
    }
    
    public getFecha(): Date { 
        return this.fecha; 
    }

    public getItems(): ItemVenta[] { 
        return [...this.items];
    }
}