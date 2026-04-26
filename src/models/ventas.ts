// export class Venta {
//     constructor(
//         protected id: string,
//         protected montoTotal: number,
//         protected diaVenta: Date,
//         protected productosVenta: Producto [] = []
//     ){}

//     // Getters y Setters ID
//     public getId(): string{
//         return this.id 
//     }

//     public setId(id: string): void {
//         this.id = id
//     }

//     // Getters y Setters MontoTotal
//     public getMontoTotal(): number{
//         return this.montoTotal
//     }

//     public setMontoTotal(montoTotal: number): void {
//         this.montoTotal = montoTotal 
//     }
    
//     //Getters y Setters DiaVenta
//     public getDiaVenta(): Date {
//         return this.diaVenta;
//     }   

//     public setDiaVenta(diaVenta: Date): void {
//         this.diaVenta = diaVenta;
//     }

//     //Getters y setters Productos
//     public getProductos(): Producto[]{
//         return this.productosVenta
//     }
    
//     public setCanchas(productosVenta: Producto[]): void {
//         if (!Array.isArray(productosVenta)) {
//             throw new Error("productosVenta debe ser un arreglo válido");
//         }
//         this.productosVenta = productosVenta;
//     }
// }