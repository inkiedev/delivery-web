# 🛵 Delivery 3D (web)

Página web para **pedir delivery y ver en una ciudad 3D, en tiempo real, dónde está cada
repartidor**. Usa como backend el proyecto de Sistemas Distribuidos (`delivery-distribuido`), al que
se conecta por GraphQL.

## ¿Dónde se cumple cada requisito?

| Requisito | Dónde |
|---|---|
| **CSS: Bootstrap** | Toda la maquetación (`navbar`, `row`/`col-lg-*`, `card`, `form-control`, `table`, `badge`, `alert`) en `src/App.jsx`. Las etiquetas flotantes del mapa 3D también son badges de Bootstrap. |
| **Front: React** | Componentes y estado con `useState` y `useEffect` en `src/App.jsx` y `src/Ciudad3D.jsx`. |
| **3D: Three.js** | `src/Ciudad3D.jsx`, con **React Three Fiber** (Three.js escrito como componentes de React) y dos ayudas de `drei` (`OrbitControls` y `Html`). |
| **Conexión al back** | `src/api.js`: un `fetch` a la API GraphQL real del proyecto distribuido. |

## Archivos

```
src/main.jsx      arranca React e importa Bootstrap
src/api.js        graphql(consulta, variables): un fetch POST a la API
src/App.jsx       pantalla: navbar, formulario, repartidores, tabla de pedidos
src/Ciudad3D.jsx  la ciudad 3D: calles, edificios, restaurantes, motos y pines
```

## Cómo correrlo

1. Levanta primero el backend (`delivery-distribuido`: RabbitMQ, `uvicorn api:app` y `python worker.py`).
2. Después:

```bash
npm install
npm run dev
```

3. Abre <http://localhost:5173>.

Si la API corre en otra computadora, crea un archivo `.env` con:

```
VITE_API_URL=http://192.168.1.10:8000/graphql
```

## Cómo se usa

- **Clic en el mapa**: elige la esquina de entrega (aparece un pin verde).
- **Arrastrar**: gira la cámara. **Rueda del mouse**: zoom.
- Escribe el cliente, elige el restaurante y presiona **Pedir**. Aparece un pin azul con el número del
  pedido, un repartidor (caja naranja) va al restaurante y después al cliente, y la tabla muestra
  cómo cambia el estado.
- El badge de arriba a la derecha dice si hay conexión con la API.

## Cómo funciona

- **Datos**: cada 0,5 s la página hace **una sola consulta GraphQL** que trae restaurantes,
  repartidores y pedidos juntos, y los guarda en un `useState`. React vuelve a dibujar todo solo.
- **Crear pedido**: la mutación `crearPedido` con el cliente, el restaurante y la esquina elegida.
- **3D**: cada objeto es un componente (`<mesh>` con una geometría y un material). Las coordenadas
  `(x, y)` de la ciudad se dibujan en `[x, altura, y]`, porque en Three.js el piso es el plano X-Z.
- **Movimiento suave**: el back mueve a los repartidores de a una cuadra; en cada cuadro la moto se
  acerca un 10 % a su posición nueva (`lerp` dentro de `useFrame`), así no da saltos.
- **Clic vs. arrastre**: el evento de clic de React Three Fiber trae `e.delta`, la distancia que se
  movió el mouse. Si es más de 4 píxeles fue un arrastre de cámara y se ignora.
