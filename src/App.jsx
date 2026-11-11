import { useEffect, useState } from "react";
import { graphql } from "./api";

// Una sola consulta trae todo lo que la pantalla necesita.
const CONSULTA = `{
  restaurantes { nombre x y }
  repartidores { nombre x y estado }
  pedidos { id cliente restaurante x y estado repartidor }
}`;

const CREAR_PEDIDO = `mutation ($cliente: String!, $restaurante: String!, $x: Int!, $y: Int!) {
  crearPedido(cliente: $cliente, restaurante: $restaurante, x: $x, y: $y) { id }
}`;

// Color de Bootstrap para cada estado
const COLORES = {
  LIBRE: "success", RECOGIENDO: "warning", ENTREGANDO: "primary",
  EN_COLA: "secondary", EN_CAMINO: "primary", ENTREGADO: "success",
};

function Estado({ valor }) {
  return <span className={`badge text-bg-${COLORES[valor]}`}>{valor}</span>;
}

export default function App() {
  const [datos, setDatos] = useState({ restaurantes: [], repartidores: [], pedidos: [] });
  const [conectado, setConectado] = useState(false);
  const [cliente, setCliente] = useState("");
  const [restaurante, setRestaurante] = useState("");
  const [destino, setDestino] = useState(null); // { x, y } elegido con un clic en el mapa
  const [error, setError] = useState("");

  // Cada 0,5 s le pedimos el estado a la API
  useEffect(() => {
    const intervalo = setInterval(() => {
      graphql(CONSULTA)
        .then((d) => { setDatos(d); setConectado(true); })
        .catch(() => setConectado(false));
    }, 500);
    return () => clearInterval(intervalo);
  }, []);

  const restauranteElegido = restaurante || datos.restaurantes[0]?.nombre || "";

  async function pedir(e) {
    e.preventDefault();
    try {
      await graphql(CREAR_PEDIDO, { cliente, restaurante: restauranteElegido, ...destino });
      setDestino(null);
      setError("");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <>
      <nav className="navbar navbar-dark bg-dark px-3">
        <span className="navbar-brand">🛵 Delivery 3D</span>
        <span className={`badge text-bg-${conectado ? "success" : "danger"}`}>
          {conectado ? "Conectado" : "Sin conexión"}
        </span>
      </nav>

      <div className="container-fluid p-3">
        <div className="row g-3">
          <div className="col-lg-8">
            <div className="card d-flex align-items-center justify-content-center text-muted" style={{ height: 520 }}>
              Mapa 3D
            </div>
          </div>

          <div className="col-lg-4">
            <form className="card card-body mb-3" onSubmit={pedir}>
              <h5 className="card-title">Nuevo pedido</h5>
              <input className="form-control mb-2" placeholder="Nombre del cliente"
                     value={cliente} onChange={(e) => setCliente(e.target.value)} />
              <select className="form-select mb-2" value={restauranteElegido}
                      onChange={(e) => setRestaurante(e.target.value)}>
                {datos.restaurantes.map((r) => <option key={r.nombre}>{r.nombre}</option>)}
              </select>
              <p className="mb-2">
                Destino: {destino ? `(${destino.x}, ${destino.y})` : <em className="text-muted">haz clic en el mapa</em>}
              </p>
              <button className="btn btn-primary" disabled={!cliente.trim() || !destino}>Pedir</button>
              {error && <div className="alert alert-danger mt-2 mb-0">{error}</div>}
            </form>

            <div className="card">
              <div className="card-header">Repartidores</div>
              <ul className="list-group list-group-flush">
                {datos.repartidores.length === 0 && <li className="list-group-item text-muted">Ninguno conectado</li>}
                {datos.repartidores.map((r) => (
                  <li key={r.nombre} className="list-group-item d-flex justify-content-between">
                    {r.nombre} <Estado valor={r.estado} />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="card mt-3">
          <div className="card-header">Pedidos</div>
          <div className="table-responsive">
            <table className="table table-sm align-middle mb-0">
              <thead>
                <tr><th>#</th><th>Cliente</th><th>Restaurante</th><th>Destino</th><th>Repartidor</th><th>Estado</th></tr>
              </thead>
              <tbody>
                {datos.pedidos.map((p) => (
                  <tr key={p.id}>
                    <td>#{p.id}</td>
                    <td>{p.cliente}</td>
                    <td>{p.restaurante}</td>
                    <td>({p.x}, {p.y})</td>
                    <td>{p.repartidor ?? "—"}</td>
                    <td><Estado valor={p.estado} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
