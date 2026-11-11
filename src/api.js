// Conexión con el proyecto de Sistemas Distribuidos (API GraphQL).
const URL_API = import.meta.env.VITE_API_URL || "http://localhost:8000/graphql";

// Envía una consulta o mutación GraphQL y devuelve "data". Si la API responde con errores, los lanza.
export async function graphql(consulta, variables = {}) {
  const respuesta = await fetch(URL_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: consulta, variables }),
  });
  const { data, errors } = await respuesta.json();
  if (errors) throw new Error(errors[0].message);
  return data;
}
