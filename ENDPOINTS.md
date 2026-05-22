# API Endpoints — Dietética España Backend

Base URL local: `http://localhost:3000`

---

## Autenticación

Todos los endpoints **excepto** `POST /auth/login` y `GET /health` requieren el header:

```
Authorization: Bearer <token>
```

### Cómo obtener el token

1. Hacer `POST /auth/login` con `email` y `password` válidos.
2. La respuesta incluye un campo `token` (JWT firmado con `JWT_SECRET`, expira según `JWT_EXPIRES_IN`, default `7d`).
3. Incluir ese token en el header `Authorization` de todas las siguientes requests.

### Errores comunes de autenticación (aplican a todos los endpoints protegidos)

| Código | Motivo |
|--------|--------|
| 401 | `Token no proporcionado` — falta header `Authorization` o no empieza con `Bearer ` |
| 401 | `Token inválido` — payload del JWT no contiene `id`/`email` como strings |
| 401 | `Token inválido o expirado` — firma incorrecta o JWT vencido |
| 500 | `Error de configuración del servidor` — `JWT_SECRET` no definido en el server |

---

## Auth

### POST /auth/login

**Autenticación:** No requerida

**Body (JSON):**
```json
{
  "email": "string — obligatorio, formato email válido",
  "password": "string — obligatorio, mínimo 1 carácter"
}
```

**Respuesta exitosa (`200`):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "9f1c2a3b-7d4e-4a8b-9c12-1a2b3c4d5e6f",
    "nombre": "Administrador",
    "email": "admin@dietetica.com"
  }
}
```

**Posibles errores:**
| Código | Motivo |
|--------|--------|
| 400 | `Email inválido` o `La contraseña es requerida` (validación Zod) |
| 401 | `Credenciales inválidas` (usuario no existe o password no coincide) |
| 500 | `Error de configuración del servidor` (JWT_SECRET no definido) |
| 500 | `Error interno del servidor` |

---

## Productos

Nota: el modelo distingue dos tipos: **suelto** (vendido por gramo, campo `precioPorGramo`) y **envasado** (vendido por unidad, campo `precioUnitario`). Ambos comparten la tabla `productos` con columna `tipo`.

### POST /productos/envasado

**Autenticación:** Requerida

**Body (JSON):**
```json
{
  "id": "string — opcional, si no se envía se genera UUID",
  "nombre": "string — obligatorio",
  "precioVenta": "number — obligatorio (o usar precioUnitario), > 0",
  "precioUnitario": "number — alias de precioVenta, opcional",
  "precioCompra": "number — opcional, default 0",
  "cantidad": "number — opcional, default 0 (stock en unidades)",
  "categoriaId": "string — obligatorio (o usar campo categoria)",
  "categoria": "string — alias de categoriaId, opcional",
  "proveedorId": "string — obligatorio",
  "oferta": "boolean — opcional, default false"
}
```

**Respuesta exitosa (`201`):**
```json
{
  "message": "Producto envasado creado con éxito"
}
```

**Posibles errores:**
| Código | Motivo |
|--------|--------|
| 400 | `Faltan campos obligatorios para el producto envasado.` (nombre/precio/proveedorId/categoria) |
| 500 | Error interno (DB, etc.) |

---

### POST /productos/suelto

**Autenticación:** Requerida

**Body (JSON):**
```json
{
  "id": "string — opcional, si no se envía se genera UUID",
  "nombre": "string — obligatorio",
  "precioVenta": "number — obligatorio (o usar precioPorGramo), > 0 (precio por gramo)",
  "precioPorGramo": "number — alias de precioVenta, opcional",
  "precioCompra": "number — opcional, default 0",
  "cantidad": "number — opcional, default 0 (stock en gramos)",
  "categoriaId": "string — obligatorio (o usar campo categoria)",
  "categoria": "string — alias de categoriaId, opcional",
  "proveedorId": "string — obligatorio",
  "oferta": "boolean — opcional, default false"
}
```

**Respuesta exitosa (`201`):**
```json
{
  "message": "Producto suelto creado con éxito"
}
```

**Posibles errores:**
| Código | Motivo |
|--------|--------|
| 400 | `Faltan campos obligatorios para el producto suelto.` |
| 500 | Error interno (DB, etc.) |

---

### GET /productos

**Autenticación:** Requerida

**Body:** ninguno

**Respuesta exitosa (`200`):**
```json
[
  {
    "id": "p-001",
    "proveedor": {
      "id": "prov-01",
      "nombre": "Proveedor Asociado",
      "mail": "",
      "nroTelefono": ""
    },
    "nombre": "Yerba Mate Orgánica 500g",
    "oferta": false,
    "cantidad": 25,
    "precioUnitario": 1850.00,
    "precioCompra": 1200.00,
    "precioVenta": 1850.00,
    "categoria": "cat-yerbas",
    "proveedorId": "prov-01",
    "tipo": "envasado"
  },
  {
    "id": "p-002",
    "proveedor": {
      "id": "prov-02",
      "nombre": "Proveedor Asociado",
      "mail": "",
      "nroTelefono": ""
    },
    "nombre": "Almendras Naturales",
    "oferta": true,
    "cantidad": 5000,
    "precioCompra": 8.00,
    "precioVenta": 15.50,
    "categoria": "cat-frutos-secos",
    "proveedorId": "prov-02",
    "tipo": "suelto"
  }
]
```

Notas:
- Producto envasado: expone `precioUnitario`; `cantidad` representa unidades.
- Producto suelto: expone `precioPorGramo` (interno, privado en la clase); `cantidad` representa gramos. `precioVenta` también está disponible.

**Posibles errores:**
| Código | Motivo |
|--------|--------|
| 500 | Error interno (DB) |

---

### PUT /productos/:id

**Autenticación:** Requerida

**Body (JSON):** (todos opcionales — campos no enviados se reescriben a defaults como `0` o `""`, ojo con eso)
```json
{
  "nombre": "string — opcional",
  "precioCompra": "number — opcional, default 0",
  "precioVenta": "number — opcional, default 0",
  "cantidad": "number — opcional, default 0",
  "categoriaId": "string — opcional (o campo categoria)",
  "categoria": "string — opcional, alias",
  "proveedorId": "string — opcional, default \"\"",
  "oferta": "boolean — opcional, default false"
}
```

**Respuesta exitosa (`200`):**
```json
{
  "message": "Producto actualizado con éxito"
}
```

**Posibles errores:**
| Código | Motivo |
|--------|--------|
| 400 | `ID de producto requerido o inválido` |
| 400 | `Producto con ID <x> no encontrado` (capturado como 400 por el catch del controller) |

---

### PATCH /productos/:id/oferta

**Autenticación:** Requerida

**Body (JSON):**
```json
{
  "estado": "boolean — obligatorio (true = en oferta, false = no)"
}
```

**Respuesta exitosa (`200`):**
```json
{
  "message": "Estado de oferta actualizado con éxito"
}
```

**Posibles errores:**
| Código | Motivo |
|--------|--------|
| 400 | `ID de producto requerido o inválido` |
| 400 | `No se encontró el producto` |

---

### DELETE /productos/:id

**Autenticación:** Requerida

**Body:** ninguno

**Respuesta exitosa (`200`):**
```json
{
  "message": "Producto eliminado con éxito"
}
```

**Posibles errores:**
| Código | Motivo |
|--------|--------|
| 400 | `ID de producto requerido o inválido` |
| 500 | `Producto no encontrado` (lanzado por el service como Error genérico → 500) |

---

## Proveedores

### POST /proveedores

**Autenticación:** Requerida

**Body (JSON):**
```json
{
  "id": "string — opcional",
  "nombre": "string — obligatorio, no vacío",
  "mail": "string — opcional, default \"\"",
  "nroTelefono": "string — opcional, default \"\""
}
```

**Respuesta exitosa (`201`):**
```json
{
  "message": "Proveedor creado con éxito"
}
```

**Posibles errores:**
| Código | Motivo |
|--------|--------|
| 400 | `El nombre del proveedor es obligatorio` |
| 400 | Error genérico capturado por el catch (ej: violación DB) |

---

### GET /proveedores

**Autenticación:** Requerida

**Body:** ninguno

**Respuesta exitosa (`200`):**
```json
[
  {
    "id": "prov-01",
    "nombre": "Distribuidora Norte SA",
    "mail": "ventas@distribuidoranorte.com",
    "nroTelefono": "+54 11 4567-8901"
  },
  {
    "id": "prov-02",
    "nombre": "Frutos Secos del Sur",
    "mail": "",
    "nroTelefono": ""
  }
]
```

**Posibles errores:**
| Código | Motivo |
|--------|--------|
| 500 | Error interno (DB) |

---

### GET /proveedores/:id

**Autenticación:** Requerida

**Body:** ninguno

**Respuesta exitosa (`200`):**
```json
{
  "id": "prov-01",
  "nombre": "Distribuidora Norte SA",
  "mail": "ventas@distribuidoranorte.com",
  "nroTelefono": "+54 11 4567-8901"
}
```

**Posibles errores:**
| Código | Motivo |
|--------|--------|
| 400 | `ID de proveedor requerido o inválido` |
| 404 | `Proveedor no encontrado` |
| 500 | Error interno (DB) |

---

### PUT /proveedores/:id

**Autenticación:** Requerida

**Body (JSON):**
```json
{
  "nombre": "string — obligatorio, no vacío",
  "mail": "string — opcional, default \"\"",
  "nroTelefono": "string — opcional, default \"\""
}
```

**Respuesta exitosa (`200`):**
```json
{
  "message": "Proveedor actualizado con éxito"
}
```

**Posibles errores:**
| Código | Motivo |
|--------|--------|
| 400 | `ID de proveedor requerido o inválido` |
| 400 | `El nombre del proveedor es obligatorio` |
| 400 | Error genérico capturado por el catch |

---

> Nota: El controller expone `eliminar` (DELETE físico) pero **no está montado en el router de proveedores**. No es accesible vía HTTP en la versión actual.

---

## Categorías

### POST /categorias

**Autenticación:** Requerida

**Body (JSON):**
```json
{
  "id": "string — opcional",
  "nombre": "string — obligatorio, no vacío (se hace trim)"
}
```

**Respuesta exitosa (`201`):**
```json
{
  "message": "Categoría creada perfectamente"
}
```

**Posibles errores:**
| Código | Motivo |
|--------|--------|
| 400 | `El nombre es requerido` |
| 500 | Error interno (DB, id duplicado, etc.) |

---

### GET /categorias

**Autenticación:** Requerida

**Body:** ninguno

**Respuesta exitosa (`200`):**
```json
[
  {
    "id": "cat-yerbas",
    "nombre": "Yerbas e Infusiones"
  },
  {
    "id": "cat-frutos-secos",
    "nombre": "Frutos Secos"
  }
]
```

**Posibles errores:**
| Código | Motivo |
|--------|--------|
| 500 | Error interno (DB) |

---

### PUT /categorias/:id

**Autenticación:** Requerida

**Body (JSON):**
```json
{
  "nombre": "string — obligatorio, no vacío (se hace trim)"
}
```

**Respuesta exitosa (`200`):**
```json
{
  "message": "Categoría actualizada correctamente"
}
```

**Posibles errores:**
| Código | Motivo |
|--------|--------|
| 400 | `ID de categoría requerido o inválido` |
| 400 | `El nombre modificado es requerido` |
| 500 | Error interno (DB) |

---

### DELETE /categorias/:id

**Autenticación:** Requerida

**Body:** ninguno

**Respuesta exitosa (`200`):**
```json
{
  "message": "Categoría eliminada"
}
```

**Posibles errores:**
| Código | Motivo |
|--------|--------|
| 400 | `ID requerido o inválido` |
| 500 | Error interno (DB, FK violation si hay productos asociados) |

---

## Ventas

### POST /ventas

**Autenticación:** Requerida

**Body (JSON):**
```json
{
  "id": "string — obligatorio (ID de la venta, lo provee el cliente)",
  "items": [
    {
      "productoId": "string — obligatorio",
      "cantidad": "number — obligatorio (unidades si envasado, gramos si suelto)"
    }
  ]
}
```

Comportamiento según tipo de producto en cada item:
- **Producto envasado**: `cantidad` se interpreta como unidades. `subtotal = cantidad * precioUnitario`. Decrementa stock en unidades.
- **Producto suelto**: `cantidad` se interpreta como gramos. `subtotal = gramos * precioPorGramo`. Decrementa stock en gramos.

En ambos casos el service llama `decrementarStock(productoId, cantidad)`, que falla si el stock actual es menor a la cantidad solicitada.

**Respuesta exitosa (`201`):**
```json
{
  "message": "Venta registrada con éxito",
  "id": "venta-2026-05-22-001",
  "total": 4250.75,
  "fecha": "2026-05-22T14:32:11.000Z"
}
```

**Posibles errores:**
| Código | Motivo |
|--------|--------|
| 400 | `Se requiere un ID de venta y una lista de items válida.` (falta `id` o `items` no es array) |
| 500 | `El producto con ID <x> no existe.` |
| 500 | `Stock insuficiente para <nombre>.` |
| 500 | Error interno (DB) |

---

### GET /ventas/:id/resumen

**Autenticación:** Requerida

**Body:** ninguno

**Respuesta exitosa (`200`):**
```json
{
  "resumen": "Venta: venta-2026-05-22-001 | Fecha: 22/5/2026 | Total: $4250.75"
}
```

**Posibles errores:**
| Código | Motivo |
|--------|--------|
| 404 | `Venta no encontrada.` |

---

## Health

### GET /health

**Autenticación:** No requerida

**Body:** ninguno

**Respuesta exitosa (`200`):**
```json
{
  "status": "ok",
  "timestamp": "2026-05-22T14:32:11.000Z"
}
```

**Posibles errores:** ninguno previsto.
