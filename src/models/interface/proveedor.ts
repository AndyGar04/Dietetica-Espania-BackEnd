import {Proveedor} from "../proveedor";

export interface proveedorCrud{
    getId(): Promise<Proveedor>
    setId(id: string): Promise<Proveedor>

}