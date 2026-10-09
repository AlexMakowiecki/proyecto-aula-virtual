const args = process.argv.slice(2);

async function handleCommand() {
  const [method, endpoint, ...values] = args;
  try {
    validateEndpoint(endpoint);
    if (method === "GET") {
      validateGetEndpoint(endpoint);
      const data = await handleRequest(endpoint);
      if (!data)
        throw new Error("No se encontró el producto con el id ingresado");
      console.log(data);
    } else if (method === "POST") {
      validatePostEndpoint(endpoint);
      const body = validatePostValues(values);
      const data = await handleRequest(endpoint, method, body);
      if (!data) throw new Error("Hubo un error al guardar el producto");
      console.log(data);
    } else if (method === "DELETE") {
      validateDeleteEndpoint(endpoint);
      const data = await handleRequest(endpoint, method);
      if (!data)
        throw new Error("No se encontró el producto con el id ingresado");
      console.log(data);
    } else {
      throw new Error("Método HTTP inválido.");
    }
  } catch (err) {
    console.error(err.message);
  }
}

async function handleRequest(
  endpoint,
  method = "GET",
  body,
  headers = { "Content-Type": "application/json" },
) {
  const response = await fetch(`https://fakestoreapi.com/${endpoint}`, {
    method,
    headers,
    body: body && JSON.stringify(body),
  });
  if (!response.ok)
    throw new Error(`Error ${response.status}: ${response.statusText}`);

  const content = await response.text();
  if (!content) return null;
  return JSON.parse(content);
}

function validateEndpoint(endpoint) {
  if (!endpoint) throw new Error("El campo de endpoint está vacío.");
  const [resource, idString, ...rest] = endpoint.split("/");
  if (rest.length > 0 || resource !== "products")
    throw new Error(
      'Endpoint inválido. Solo hay dos endpoints válidos (dependiendo del método): "products" y "products/<productId>"',
    );
}

function validateDeleteEndpoint(endpoint) {
  const [resource, idString] = endpoint.split("/");
  const id = Number(idString);
  if (!Number.isInteger(id) || id <= 0)
    throw new Error(
      "Id de producto inválido. Se espera como id un número entero positivo.",
    );
}

function validateGetEndpoint(endpoint) {
  const [resource, idString] = endpoint.split("/");
  if (idString) {
    const id = Number(idString);
    if (!Number.isInteger(id) || id <= 0)
      throw new Error(
        "Id de producto inválido. Se espera como id un número entero positivo.",
      );
  }
}

function validatePostEndpoint(endpoint) {
  if (endpoint !== "products")
    throw new Error(
      'Endpoint inválido. Para petición POST solo hay un endpoint válido: "products"',
    );
}

function validatePostValues(values) {
  const [title, priceString, category, ...rest] = values;
  const price = Number(priceString);

  if (!title?.trim())
    throw new Error("El valor del título es inválido o inexistente");
  if (!priceString?.trim() || !Number.isFinite(price) || price < 0)
    throw new Error("El valor del precio es inválido o inexistente");
  if (!category?.trim())
    throw new Error("El valor de la categoría es inválido o inexistente");
  if (rest.length > 0)
    throw new Error(
      "El producto solo puede y debe tener 3 propiedades (en orden): título, precio y categoría",
    );
  return { title, price, category };
}

handleCommand();
