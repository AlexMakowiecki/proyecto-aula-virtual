# Pre-Entrega de Proyecto – Node.js

Herramienta de línea de comandos para gestionar los productos de una tienda en línea usando la [FakeStore API](https://fakestoreapi.com/).
Permite consultar, crear y eliminar productos desde la terminal.

**Autor:** Alex Makowiecki

> [!NOTE]
> **Uso de IA (Claude).** Durante el desarrollo usé Claude (Anthropic) como apoyo. En todos los casos, la lógica del programa la escribí yo.
>
> - **Material del curso:** me ayudó a leer y resumir la consigna y el contenido de las clases 05 y 06.
> - **Consultas puntuales:** le pregunté sobre conceptos de JavaScript y Node, como métodos de strings, `Number()`, el uso de `fetch` o convenciones para nombrar funciones.
> - **Revisión del código:** me marcó los errores y los casos que no estaban cubiertos, y yo hice las correcciones. También probó qué valida y qué no la FakeStore API.
> - **Últimos detalles:** quitó un `console.log` de depuración y corrigió las tildes de los mensajes.
> - **Git y documentación:** subió el proyecto a GitHub y redactó este README.

---

## Requisitos

- **Node.js 18 o superior.** Se usa `fetch`, que viene incluido en Node desde la versión 18. El proyecto se desarrolló y probó con Node 22.
- Conexión a internet, para acceder a la FakeStore API.

No tiene dependencias externas, así que no hace falta correr `npm install`.

## Instalación

```bash
git clone https://github.com/AlexMakowiecki/proyecto-aula-virtual.git
cd proyecto-aula-virtual
```

## Uso

Todos los comandos siguen este formato:

```bash
npm run start <MÉTODO> <endpoint> [valores...]
```

### Consultar todos los productos

```bash
npm run start GET products
```

### Consultar un producto específico

```bash
npm run start GET products/15
```

### Crear un producto nuevo

```bash
npm run start POST products T-Shirt-Rex 300 remeras
```

Los valores van en este orden: `<title> <price> <category>`.
Si el título tiene espacios, va entre comillas: `npm run start POST products "Remera Rex" 300 remeras`.

### Eliminar un producto

```bash
npm run start DELETE products/7
```

---

## Validaciones y manejo de errores

Antes de llamar a la API, el programa valida lo que ingresa el usuario. Si algo está mal, muestra un mensaje claro y no hace la petición.

| Caso | Ejemplo | Resultado |
|---|---|---|
| Falta el endpoint | `npm run start GET` | `El campo de endpoint está vacío.` |
| Método no soportado | `npm run start PUT products/1` | `Método HTTP inválido.` |
| Recurso inexistente | `npm run start GET users` | `Endpoint inválido...` (indica los endpoints válidos) |
| Partes de más en la ruta | `npm run start GET products/1/x` | `Endpoint inválido...` |
| Id que no es un entero positivo | `GET products/abc`, `products/-3`, `products/0` | `Id de producto inválido...` |
| `DELETE` sin id | `npm run start DELETE products` | `Id de producto inválido...` |
| `POST` con id | `npm run start POST products/5 ...` | `Endpoint inválido. Para petición POST solo hay un endpoint válido...` |
| `POST` con un precio inválido | `POST products Remera abc remeras` | `El valor del precio es inválido o inexistente` |
| `POST` con valores faltantes | `POST products Remera 300` | `El valor de la categoría es inválido o inexistente` |
| `POST` con valores de más | `POST products Remera 300 remeras extra` | `El producto solo puede y debe tener 3 propiedades...` |
| Producto inexistente | `GET products/9999`, `DELETE products/9999` | `No se encontró el producto con el id ingresado` |
| La API responde con error | (404, 500, etc.) | `Error <código>: <descripción>` |

Todos los errores se capturan en un único bloque `try/catch`, en `handleCommand`, que muestra solo el mensaje (`console.error(err.message)`), sin el stack trace.

### Comportamientos de la FakeStore API que se tuvieron en cuenta

- **Id inexistente:** la API responde `200 OK` con el **cuerpo vacío**, en lugar de un 404. Por eso `handleRequest` lee la respuesta como texto y devuelve `null` si viene vacía. El comando que hizo la petición interpreta ese `null` como "producto no encontrado".
- **`POST` sin validación:** la API acepta cualquier dato, incluso un precio no numérico o campos vacíos, y responde `201` igual. Por eso la validación de los valores del `POST` se hace del lado del programa.
- **API de prueba:** la FakeStore API no guarda los cambios. El `POST` devuelve siempre un id ficticio y el `DELETE` no borra el producto de verdad. El programa muestra la respuesta tal como llega.

---

## Estructura del código

Todo el programa está en `index.js`:

| Función | Responsabilidad |
|---|---|
| `handleCommand()` | Punto de entrada. Lee los argumentos con `process.argv`, decide qué hacer según el método y captura los errores. |
| `handleRequest(endpoint, method, body, headers)` | Función genérica que hace la petición con `fetch`. Verifica `response.ok`, convierte el `body` a JSON cuando existe y devuelve `null` si la respuesta viene vacía. |
| `validateEndpoint(endpoint)` | Validación común: que el endpoint exista, que el recurso sea `products` y que no haya partes de más. |
| `validateGetEndpoint(endpoint)` | En un `GET`, el id es opcional; si está, tiene que ser un entero positivo. |
| `validateDeleteEndpoint(endpoint)` | En un `DELETE`, el id es obligatorio y tiene que ser un entero positivo. |
| `validatePostEndpoint(endpoint)` | En un `POST`, el único endpoint válido es `products`. |
| `validatePostValues(values)` | Valida el título, el precio y la categoría, y devuelve el objeto que se envía como `body`. |

### Conceptos aplicados

- **ES Modules:** `"type": "module"` en el `package.json`.
- **Script `start`** en el `package.json`.
- **`process.argv`** para leer los comandos ingresados.
- **`fetch` con `async`/`await`** para comunicarse con la API.
- **Destructuring y rest/spread:** `const [method, endpoint, ...values] = args`.
- **Métodos de strings y arrays:** `split`, `slice` y `trim`.
- **Manejo de errores** con `throw new Error(...)` y un único `try/catch`.
