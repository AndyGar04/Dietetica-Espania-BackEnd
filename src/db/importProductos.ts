import 'dotenv/config';
import { randomUUID } from 'crypto';
import db from './client';
import { initSchema } from './schema';

/* ============================================================
   IMPORT ONE-TIME DE PRODUCTOS
   ------------------------------------------------------------
   Carga masiva inicial. El cliente solo pasó nombre + precio
   de venta, así que el resto queda en sus defaults:
     precioCompra = 0, cantidad = 0, proveedorId = '',
     fechaVencimiento = null, tipo = 'envasado', oferta = 0
   Después se completan editando cada producto desde la UI.

   - Categorías inferidas por nombre. Revisar/reclasificar en UI.
   - 7 productos sin precio cargados con precioVenta = 0.
   - Idempotente: re-ejecutar NO duplica (categorías por nombre,
     productos por nombre).

   Correr:  npm run import:productos
   ============================================================ */

type ItemImport = { nombre: string; precioVenta: number };
type GrupoImport = { categoria: string; productos: ItemImport[] };

const DATA: GrupoImport[] = [
  {
    categoria: 'Hierbas',
    productos: [
      { nombre: 'Ajenjo - Artemisa (hierba)', precioVenta: 2500 },
      { nombre: 'Alcachofa (hierba)', precioVenta: 2500 },
      { nombre: 'Alfalfa (hierba)', precioVenta: 2500 },
      { nombre: 'Ambay (hierba)', precioVenta: 2500 },
      { nombre: 'Anacahuita (hierba)', precioVenta: 2500 },
      { nombre: 'Arenaria (hierba)', precioVenta: 2500 },
      { nombre: 'Bardana (hierba)', precioVenta: 2500 },
    ],
  },
  {
    categoria: 'Especias y Condimentos',
    productos: [
      { nombre: 'Adobo para pizza', precioVenta: 2200 },
      { nombre: 'Aji molido', precioVenta: 2500 },
      { nombre: 'Ajinomoto 100gr', precioVenta: 9100 },
      { nombre: 'Ajo en escamas', precioVenta: 2500 },
      { nombre: 'Ajo granulado', precioVenta: 2600 },
      { nombre: 'Ajo molido', precioVenta: 2500 },
      { nombre: 'Albahaca', precioVenta: 2500 },
      { nombre: 'Anis estrellado entero', precioVenta: 10000 },
      { nombre: 'Anis semilla', precioVenta: 4000 },
      { nombre: 'Apio semilla', precioVenta: 3000 },
      { nombre: 'Arytza pimentón ahumado', precioVenta: 7400 },
      { nombre: 'Baharat (7 especias)', precioVenta: 3000 },
      { nombre: 'Shio masala 60gr', precioVenta: 8800 },
      { nombre: 'Hondashi caldo de pescado x 6 sobres', precioVenta: 3200 },
      { nombre: 'Dusen rub para carne asada', precioVenta: 4900 },
      { nombre: 'Dusen rub para carne cerdo', precioVenta: 4900 },
      { nombre: 'Dusen rub para pescado', precioVenta: 4900 },
      { nombre: 'Dusen rub para pollo', precioVenta: 4900 },
      { nombre: 'Dusen rub para arroces', precioVenta: 4200 },
      { nombre: 'Dusen rub para papas', precioVenta: 4200 },
    ],
  },
  {
    categoria: 'Aceites',
    productos: [
      { nombre: 'Aceite de oregano 90%', precioVenta: 27000 },
      { nombre: 'God bless aceite de coco virgen 225ml', precioVenta: 15300 },
      { nombre: 'God bless aceite de coco virgen 500ml', precioVenta: 29400 },
      { nombre: 'Entrenuts aceite de coco virgen', precioVenta: 14800 },
      { nombre: 'Nutrasem aceite de chia 250ml', precioVenta: 16500 },
      { nombre: 'Nutrasem aceite de lino', precioVenta: 10200 },
      { nombre: 'Nutrasem aceite de sésamo', precioVenta: 10200 },
      { nombre: 'Cedro azul aceite de uva 1/2', precioVenta: 18800 },
      { nombre: 'Cedro azul aceite de uva 1/4', precioVenta: 11200 },
      { nombre: 'Sitaram aceite de ricino extra virgen', precioVenta: 12900 },
      { nombre: 'Ganofi aceite de palta 250ml', precioVenta: 13300 },
      { nombre: 'Quinta generación aceite de oliva virgen 1lt', precioVenta: 35000 },
      { nombre: 'Quinta generación aceite de oliva virgen 500ml', precioVenta: 22500 },
      { nombre: 'Quinta generación aceite de oliva virgen 250ml', precioVenta: 12400 },
      { nombre: 'Sabor pampeano aceite de oliva virgen 250ml', precioVenta: 6400 },
      { nombre: 'Sabor pampeano aceite de oliva virgen 500ml', precioVenta: 9000 },
      { nombre: 'Sabor pampeano aceite de oliva virgen 1lt', precioVenta: 16800 },
    ],
  },
  {
    categoria: 'Sales',
    productos: [
      { nombre: 'Shio cristales de sal marina', precioVenta: 5800 },
      { nombre: 'Shio sal de cilantro, tomillo y estragon 140gr', precioVenta: 5200 },
      { nombre: 'Shio sal ahumado y vainilla', precioVenta: 4000 },
      { nombre: 'Shio sal albahaca y menta 200gr', precioVenta: 4000 },
      { nombre: 'Shio sal bbq', precioVenta: 5800 },
      { nombre: 'Shio sal curry y sésamo', precioVenta: 5300 },
      { nombre: 'Shio sal de garam y masala', precioVenta: 5300 },
      { nombre: 'Shio sal de hierbas', precioVenta: 5300 },
      { nombre: 'Shio sal de jengibre y ajo', precioVenta: 5300 },
      { nombre: 'Shio sal de tomate asado', precioVenta: 5300 },
      { nombre: 'Shio sal jalapeño y lima', precioVenta: 5300 },
      { nombre: 'Shio sal marina con hierbas finas', precioVenta: 5300 },
      { nombre: 'Shio sal mostaza y romero', precioVenta: 5300 },
      { nombre: 'Shio sal naranja hierbas y ajo', precioVenta: 5300 },
      { nombre: 'Shio sal pimentón ahumado y aji cayena', precioVenta: 5300 },
      { nombre: 'Shio sal pimienta y limón', precioVenta: 5300 },
      { nombre: 'Shio sal salvia y ajo', precioVenta: 5300 },
      { nombre: 'Gell shing sal marina fina 500gr', precioVenta: 3200 },
      { nombre: 'Gell shing sal marina baja en sodio 500gr', precioVenta: 6200 },
    ],
  },
  {
    categoria: 'Salsas y Aderezos',
    productos: [
      { nombre: 'Alcaraz mostaza de dijon', precioVenta: 7300 },
      { nombre: 'Alcaraz salsa inglesa', precioVenta: 5500 },
      { nombre: 'Arcor salsa', precioVenta: 1500 },
      { nombre: 'Arytza mostaza a la miel', precioVenta: 6200 },
      { nombre: 'Arytza mostaza alemana', precioVenta: 5900 },
      { nombre: 'Arytza mostaza a la antigua', precioVenta: 6400 },
      { nombre: 'Arytza barbacoa', precioVenta: 6400 },
      { nombre: 'Arytza ketchup ahumado', precioVenta: 8500 },
      { nombre: 'Arytza mayonesa ahumada', precioVenta: 7700 },
      { nombre: 'Arytza mayonesa clásica', precioVenta: 6900 },
      { nombre: 'Arytza mostaza ahumada', precioVenta: 6600 },
      { nombre: 'Arytza veganesa zanahoria', precioVenta: 4900 },
      { nombre: 'Bitarwan salsa de soja 250ml', precioVenta: 4600 },
      { nombre: 'Bitarwan salsa de soja 500ml', precioVenta: 7800 },
      { nombre: 'Bitarwan salsa de soja picante cremosa', precioVenta: 9000 },
      { nombre: 'Vanoli salsa de soja', precioVenta: 2600 },
      { nombre: 'Gell shing salsa de soja 0% sodio', precioVenta: 6700 },
      { nombre: 'Sakanashi salsa de soja 450ml', precioVenta: 6400 },
      { nombre: 'San Giorgio humo liquido', precioVenta: 8000 },
      { nombre: 'San Giorgio humo solido', precioVenta: 8000 },
      { nombre: 'Pampa gourmet salsa de mostaza y miel', precioVenta: 7500 },
      { nombre: 'Pampa gourmet mostaza de dijon', precioVenta: 6900 },
      { nombre: 'Tabasco originas habanero hot', precioVenta: 15200 },
      { nombre: 'Fish sauce salsa de pescado 340ml', precioVenta: 13600 },
      { nombre: 'Lee kum salsa de ostras', precioVenta: 19800 },
    ],
  },
  {
    categoria: 'Vinagres y Acetos',
    productos: [
      { nombre: 'Enrico barone aceto reducción 375ml', precioVenta: 3300 },
      { nombre: 'Enrico barone aceto borgoña 375ml', precioVenta: 3600 },
      { nombre: 'Casalta aceto reducción 1/2', precioVenta: 7600 },
      { nombre: 'Pampa gourmet vinagre de manzana', precioVenta: 9000 },
    ],
  },
  {
    categoria: 'Fideos y Pastas',
    productos: [
      { nombre: 'Fu sheng fideo de arroz espinaca 200gr', precioVenta: 6000 },
      { nombre: 'Fu sheng fideo de arroz fino 200gr', precioVenta: 6000 },
      { nombre: 'Fu sheng fideo de arroz fino 500gr', precioVenta: 10000 },
      { nombre: 'Fu sheng fideo de arroz grueso 500gr', precioVenta: 10000 },
      { nombre: 'Fu sheng fideo de arroz morrón 200gr', precioVenta: 6000 },
      { nombre: 'Fu sheng fideo de arroz natural 200gr', precioVenta: 6000 },
      { nombre: 'Fu sheng fideo de arroz zanahoria 200gr', precioVenta: 6900 },
      { nombre: 'Soy arroz fideo integral 300gr', precioVenta: 3300 },
      { nombre: 'Soy arroz fideo espinaca', precioVenta: 3300 },
      { nombre: 'Soy arroz fideo morrón', precioVenta: 3300 },
      { nombre: 'Wakas fusilli amaranto', precioVenta: 3700 },
      { nombre: 'Wakas fusilli de chia', precioVenta: 3700 },
      { nombre: 'Wakas fusilli de quinoa', precioVenta: 3700 },
      { nombre: 'Lilen espinaca 500gr', precioVenta: 4300 },
      { nombre: 'Lilen tirabuzón 200gr', precioVenta: 2000 },
      { nombre: 'Lilen tirabuzón multicolor', precioVenta: 2000 },
      { nombre: 'Ceral fideo integral', precioVenta: 3800 },
      { nombre: 'Ceral fideo integral morrón', precioVenta: 3800 },
      { nombre: 'Ceral fideo integral espinaca', precioVenta: 3800 },
      { nombre: 'Ceral fideos integrales', precioVenta: 3500 },
    ],
  },
  {
    categoria: 'Arroces y Legumbres',
    productos: [
      { nombre: 'Arroz basmanti india x kg', precioVenta: 9500 },
      { nombre: 'Arroz carnaroli x kg', precioVenta: 8900 },
      { nombre: 'Arroz integral fino x kg', precioVenta: 2500 },
      { nombre: 'Arroz jazmin x kg', precioVenta: 0 },
      { nombre: 'Arroz koshi para sushi x kg', precioVenta: 6000 },
      { nombre: 'Arvejas enteras x kg', precioVenta: 2200 },
      { nombre: 'Arvejas partidas x kg', precioVenta: 2800 },
    ],
  },
  {
    categoria: 'Harinas y Premezclas',
    productos: [
      { nombre: 'Aglu rebozador 450gr', precioVenta: 4300 },
      { nombre: 'All rice rebozador de arroz integral con sal', precioVenta: 3000 },
      { nombre: 'All rice rebozador de arroz integral sin sal', precioVenta: 3000 },
      { nombre: 'Arrocen rebozador de arroz 240gr', precioVenta: 2800 },
      { nombre: 'Benot goma xantica', precioVenta: 0 },
      { nombre: 'Benot polvo para hornear', precioVenta: 2300 },
      { nombre: 'Santa Maria premezclas', precioVenta: 8500 },
      { nombre: 'Yin yang harina de arroz tostada', precioVenta: 4200 },
      { nombre: 'Nat seed harina de almendra', precioVenta: 8000 },
      { nombre: 'Semillas gauchas harina de sarraceno', precioVenta: 4000 },
      { nombre: 'Diocomere fécula de maíz 450gr', precioVenta: 2200 },
      { nombre: 'Diocomere fécula de mandioca 450gr', precioVenta: 3300 },
      { nombre: 'Diocomere harina de avena integral 350gr', precioVenta: 4000 },
      { nombre: 'Diocomere premezcla pan integral proteica', precioVenta: 5500 },
      { nombre: 'Diocomere premezcla universal proteica', precioVenta: 5500 },
      { nombre: 'Onza de oro harina de garbanzo', precioVenta: 4000 },
      { nombre: 'Glutal fécula de mandioca', precioVenta: 4500 },
      { nombre: 'Glutal harina de arroz', precioVenta: 5000 },
      { nombre: 'Gluten puro x kg', precioVenta: 23500 },
      { nombre: 'Dimax almidon de maíz', precioVenta: 3800 },
      { nombre: 'Dimax fécula de mandioca x kg', precioVenta: 4000 },
      { nombre: 'Dimax fécula de mandioca 500gr', precioVenta: 3300 },
      { nombre: 'Dimax premezcla universal x kg', precioVenta: 5000 },
    ],
  },
  {
    categoria: 'Galletitas y Panificados',
    productos: [
      { nombre: 'Aldana galletitas galateas 160gr', precioVenta: 4200 },
      { nombre: 'Gullon fibra integral', precioVenta: 4000 },
      { nombre: 'Gullon obleas', precioVenta: 2500 },
      { nombre: 'Oreo Sin Tacc', precioVenta: 2900 },
      { nombre: 'Delicel galletitas SIN TACC', precioVenta: 2800 },
      { nombre: 'Doninas galletitas SIN TACC', precioVenta: 2900 },
      { nombre: 'Santa Maria galletitas SIN TACC caja', precioVenta: 3000 },
      { nombre: 'Schar pan SIN TACC multicereal', precioVenta: 7200 },
      { nombre: 'Nutresan galletitas dulce trigo naranja', precioVenta: 2800 },
      { nombre: 'Nutresan galletitas dulce avena limón', precioVenta: 3000 },
      { nombre: 'Nutresan aritos naranja chocolate', precioVenta: 3900 },
      { nombre: 'Ceral galletitas 380gr', precioVenta: 4500 },
      { nombre: 'Ceral galletitas 180gr', precioVenta: 2500 },
      { nombre: 'Ceral galletitas integrales s/a', precioVenta: 2800 },
      { nombre: 'Integralia diabest galletitas', precioVenta: 2600 },
      { nombre: 'Integralia galletitas integrales', precioVenta: 2400 },
      { nombre: 'Integralia pepas integrales', precioVenta: 3000 },
      { nombre: 'Rodez galletas de arroz', precioVenta: 1900 },
      { nombre: 'Molino del bosque galletitas de arroz', precioVenta: 2500 },
      { nombre: 'Yin yang tostadas de quinoa', precioVenta: 1900 },
      { nombre: 'Smams budín sin azúcar', precioVenta: 6700 },
    ],
  },
  {
    categoria: 'Granolas y Cereales',
    productos: [
      { nombre: 'Archimboldo granola crocante con semilla 1kg', precioVenta: 11000 },
      { nombre: 'Archimboldo granola energética 1kg', precioVenta: 11000 },
      { nombre: 'Archimboldo granola especial 1kg', precioVenta: 11000 },
      { nombre: 'Archimboldo granola natural 1kg', precioVenta: 11000 },
      { nombre: 'Archimboldo granola Premium 1kg', precioVenta: 11500 },
      { nombre: 'Archimboldo granola tropical 1kg', precioVenta: 11000 },
      { nombre: 'Avena instantánea 1/2kg', precioVenta: 2500 },
      { nombre: 'Avena instantánea 1kg', precioVenta: 4400 },
      { nombre: 'Nat seed super granola', precioVenta: 5000 },
      { nombre: 'Diocomere avena gruesa integral', precioVenta: 3800 },
      { nombre: 'Diocomere avena instantánea', precioVenta: 3700 },
      { nombre: 'Yin yang quinoa', precioVenta: 1500 },
    ],
  },
  {
    categoria: 'Frutos secos',
    productos: [
      { nombre: 'Almendra con chocolate', precioVenta: 3700 },
      { nombre: 'Almendra', precioVenta: 4000 },
      { nombre: 'Arandano rojo', precioVenta: 2500 },
      { nombre: 'Avellana', precioVenta: 3600 },
      { nombre: 'Nat seed multifrutos', precioVenta: 6500 },
    ],
  },
  {
    categoria: 'Semillas',
    productos: [
      { nombre: 'Aiken lino dorado S/TACC', precioVenta: 4500 },
      { nombre: 'Nat seed psillium', precioVenta: 9000 },
      { nombre: 'Nat seed rawmesan', precioVenta: 4500 },
      { nombre: 'Nat seed semilla de sésamo integral molida', precioVenta: 3000 },
      { nombre: 'Nat seed semilla de chia', precioVenta: 3800 },
      { nombre: 'Nat seed semilla de lino molida', precioVenta: 3000 },
      { nombre: 'Nat seed semilla de sésamo integral', precioVenta: 7200 },
      { nombre: 'Semillas gauchas semillas de sarraceno', precioVenta: 4400 },
    ],
  },
  {
    categoria: 'Conservas',
    productos: [
      { nombre: 'Alcaraz alcaparras 50gr', precioVenta: 5500 },
      { nombre: 'Alcaraz cerezas en almibar 150gr', precioVenta: 7000 },
      { nombre: 'Alcaraz choclitos 200gr', precioVenta: 7000 },
      { nombre: 'Alcaraz chucrut 310gr', precioVenta: 5200 },
      { nombre: 'Alcaraz espárragos 300gr', precioVenta: 7200 },
      { nombre: 'Alcaraz jalapeño rojo', precioVenta: 5500 },
      { nombre: 'Alcaraz jalapeño verde', precioVenta: 5500 },
      { nombre: 'Alcaraz lupines 300gr', precioVenta: 4400 },
      { nombre: 'Alcaraz pepinos agridulces', precioVenta: 6000 },
    ],
  },
  {
    categoria: 'Algas',
    productos: [
      { nombre: 'Argendiet agar agar', precioVenta: 0 },
      { nombre: 'Argendiet alga nory para sushi x 12 planchas', precioVenta: 0 },
      { nombre: 'Argendiet alga nory para sushi x 6', precioVenta: 0 },
      { nombre: 'Argendiet alga nory picada 100gr', precioVenta: 0 },
      { nombre: 'Argendiet alga nory picada 50gr', precioVenta: 0 },
      { nombre: 'Argendiet kombu entera 100gr', precioVenta: 13400 },
    ],
  },
  {
    categoria: 'Endulzantes y Azúcares',
    productos: [
      { nombre: 'Azucar impalpable', precioVenta: 3800 },
      { nombre: 'Azucar mascabo', precioVenta: 4800 },
      { nombre: 'Azucar negra', precioVenta: 3800 },
      { nombre: 'Azucar rubia', precioVenta: 3200 },
    ],
  },
  {
    categoria: 'Dulces y Mermeladas',
    productos: [
      { nombre: 'Arcor turrón mani', precioVenta: 400 },
      { nombre: 'Regidiet dulce de leche con cacao', precioVenta: 9000 },
      { nombre: 'Regidiet dulce de leche', precioVenta: 9000 },
      { nombre: 'Doña de magdalena dulce de leche', precioVenta: 7200 },
      { nombre: 'Trini dulce de leche', precioVenta: 8800 },
      { nombre: 'Royal gelatina sin azúcar', precioVenta: 1800 },
    ],
  },
  {
    categoria: 'Chocolates',
    productos: [
      { nombre: 'Arcor águila chocolate 70% cacao', precioVenta: 11100 },
      { nombre: 'Arcor águila chocolate 80% cacao', precioVenta: 13300 },
      { nombre: 'Arcor águila chocolate con naranja 60% cacao', precioVenta: 8300 },
    ],
  },
  {
    categoria: 'Suplementos',
    productos: [
      { nombre: 'Acido ascórbico', precioVenta: 4500 },
      { nombre: 'Anahi apis muscular 10 comp', precioVenta: 4800 },
      { nombre: 'Andino N1 (tranquilizante)', precioVenta: 5100 },
      { nombre: 'Andino N2 (asma)', precioVenta: 5100 },
      { nombre: 'Andino N3 (ansiolítico)', precioVenta: 5100 },
      { nombre: 'Andino N4 (antiespasmódico)', precioVenta: 5100 },
      { nombre: 'Andino N5 (varices)', precioVenta: 7200 },
      { nombre: 'Andino N6 (digestivo)', precioVenta: 5100 },
      { nombre: 'Andino N7 (re-vital)', precioVenta: 5100 },
      { nombre: 'Andino N12 (parasitos)', precioVenta: 5100 },
      { nombre: 'Andino N14 (cerebral)', precioVenta: 5100 },
      { nombre: 'Andino N19 (diurético)', precioVenta: 5100 },
      { nombre: 'Andino N23 (presión)', precioVenta: 5100 },
      { nombre: 'Andino N25 (hepático)', precioVenta: 5100 },
      { nombre: 'Andino N26 (insomnio)', precioVenta: 5100 },
      { nombre: 'Argenfarma li chang 8 caps', precioVenta: 31900 },
      { nombre: 'Argenfarma li chang 4 caps', precioVenta: 17100 },
      { nombre: 'Argenfarma li fem 4 caps', precioVenta: 18700 },
      { nombre: 'Bad monkey citrato de potasio', precioVenta: 25000 },
      { nombre: 'Bad monkey citrato de magnesio', precioVenta: 24500 },
      { nombre: 'Entrenuts barras proteicas', precioVenta: 2200 },
    ],
  },
  {
    categoria: 'Snacks',
    productos: [
      { nombre: 'Almadre chips de cebolla 170gr', precioVenta: 2800 },
      { nombre: 'Almadre pita chips de cebolla 170gr', precioVenta: 2800 },
      { nombre: 'Almadre pita chips jalapeño', precioVenta: 2800 },
      { nombre: 'Almadre pita chip original 170gr', precioVenta: 2800 },
      { nombre: 'Almadre snack rawmesan y remolacha', precioVenta: 2800 },
      { nombre: 'Almadre snack tomate y romero', precioVenta: 2800 },
      { nombre: 'Alwa batatas rurales', precioVenta: 2000 },
      { nombre: 'Alwa papas rurales', precioVenta: 2000 },
      { nombre: 'Nuestros sabores chips batatas', precioVenta: 2000 },
      { nombre: 'Nuestros sabores papas rusticas', precioVenta: 2000 },
      { nombre: 'Nuestros sabores batatas con merken', precioVenta: 2000 },
      { nombre: 'Nuestros sabores papas thai', precioVenta: 2000 },
      { nombre: 'Santa maria palitos de queso SIN TACC', precioVenta: 4400 },
    ],
  },
  {
    categoria: 'Bebidas e Infusiones',
    productos: [
      { nombre: 'Arlistan café instantáneo', precioVenta: 3800 },
      { nombre: 'Baggio multifruta 1lt', precioVenta: 3100 },
      { nombre: 'Baggio multifruta 200ml', precioVenta: 1000 },
      { nombre: 'Pranamar agua de mar 5lt', precioVenta: 17000 },
      { nombre: 'Pranamar agua de mar 1lt', precioVenta: 7000 },
    ],
  },
  {
    categoria: 'Untables y Pastas',
    productos: [
      { nombre: 'Alcaraz salsa tahine 200gr', precioVenta: 9200 },
      { nombre: 'Entrenuts pasta de mani natural', precioVenta: 3500 },
      { nombre: 'Entrenuts pasta de mani proteica cookies', precioVenta: 4800 },
      { nombre: 'Entrenuts pasta de mani proteica caramelo', precioVenta: 4800 },
      { nombre: 'Mestizo tahini pasta de sésamo 180gr', precioVenta: 9000 },
      { nombre: 'Pampa gourmet hummus de garbanzo organico', precioVenta: 5300 },
      { nombre: 'Pampa gourmet hummus de poroto mung', precioVenta: 5300 },
    ],
  },
  {
    categoria: 'Cosmética Natural',
    productos: [
      { nombre: 'Aqua natural aceite hamamelis', precioVenta: 2500 },
      { nombre: 'Aqua natural aceite melisa', precioVenta: 2500 },
      { nombre: 'Gell shing sal de baño', precioVenta: 5500 },
    ],
  },
  {
    categoria: 'Otros / Varios',
    productos: [
      { nombre: 'Soyana tofu', precioVenta: 12000 },
    ],
  },
];

const norm = (s: string) => s.trim().toLowerCase();

async function getOrCreateCategoria(nombre: string): Promise<string> {
  const existentes = await db.execute('SELECT id, nombre FROM categorias');
  const match = existentes.rows.find(
    (r: any) => norm(String(r.nombre)) === norm(nombre)
  );
  if (match) return String((match as any).id);

  const id = randomUUID();
  await db.execute({
    sql: 'INSERT INTO categorias (id, nombre, activo) VALUES (?, ?, 1)',
    args: [id, nombre.trim()],
  });
  console.log(`Categoría creada: ${nombre}`);
  return id;
}

async function importar() {
  await initSchema();

  // Nombres ya existentes -> evitar duplicados al re-ejecutar.
  const existentes = await db.execute('SELECT nombre FROM productos');
  const yaCargados = new Set(
    existentes.rows.map((r: any) => norm(String(r.nombre)))
  );

  let creados = 0;
  let saltados = 0;

  for (const grupo of DATA) {
    const categoriaId = await getOrCreateCategoria(grupo.categoria);

    for (const p of grupo.productos) {
      if (yaCargados.has(norm(p.nombre))) {
        saltados++;
        continue;
      }

      await db.execute({
        sql: `INSERT INTO productos
          (id, nombre, tipo, precioCompra, precioVenta, cantidad, oferta, categoria, proveedorId, fechaVencimiento)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          randomUUID(),
          p.nombre.trim(),
          'envasado',
          0,                          // precioCompra
          Number(p.precioVenta) || 0, // precioVenta
          0,                          // cantidad
          0,                          // oferta
          categoriaId,
          '',                         // proveedorId
          null,                       // fechaVencimiento
        ],
      });

      yaCargados.add(norm(p.nombre));
      creados++;
    }
  }

  console.log(`\nImport listo. Creados: ${creados} | Saltados (ya existían): ${saltados}`);
}

importar().catch((err) => {
  console.error('Import falló:', err);
  process.exit(1);
});
