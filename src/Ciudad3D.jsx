import { useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";
import { Vector3 } from "three";

// La ciudad es una cuadrícula de calles de 0 a 8.
// Una esquina (x, y) del back se dibuja en Three.js en la posición [x, altura, y].
const limitar = (n) => Math.min(8, Math.max(0, n));

// Texto flotante con un badge de Bootstrap (no bloquea los clics sobre el mapa)
function Etiqueta({ texto, color }) {
  // Esperar a que el Canvas termine de conectarse; si no, drei recrea la etiqueta y se pierde
  const listo = useThree((estado) => estado.events.connected);
  if (!listo) return null;
  return (
    <Html center position={[0, 0.9, 0]} pointerEvents="none">
      <span className={`badge text-bg-${color}`}>{texto}</span>
    </Html>
  );
}

// Cono apuntando hacia abajo + etiqueta: restaurantes, destinos y el destino elegido
function Pin({ x, y, color, texto, badge }) {
  return (
    <group position={[x, 0, y]}>
      <mesh position={[0, 0.4, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.18, 0.5, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <Etiqueta texto={texto} color={badge} />
    </group>
  );
}

// Un repartidor: se desliza suavemente hacia su última posición conocida
function Moto({ repartidor }) {
  const ref = useRef();
  const [inicio] = useState([repartidor.x, 0, repartidor.y]); // solo la posición inicial
  useFrame(() => {
    ref.current.position.lerp(new Vector3(repartidor.x, 0, repartidor.y), 0.1);
  });
  return (
    <group ref={ref} position={inicio}>
      <mesh position={[0, 0.2, 0]}>
        <boxGeometry args={[0.4, 0.3, 0.4]} />
        <meshStandardMaterial color="orange" />
      </mesh>
      <Etiqueta texto={repartidor.nombre} color="dark" />
    </group>
  );
}

// Un edificio en el centro de cada cuadra, con alturas variadas (siempre las mismas)
function Edificios() {
  const edificios = [];
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      const alto = 0.3 + ((i * 7 + j * 13) % 4) * 0.25;
      edificios.push(
        <mesh key={`${i}-${j}`} position={[i + 0.5, alto / 2, j + 0.5]}>
          <boxGeometry args={[0.6, alto, 0.6]} />
          <meshStandardMaterial color="#ced4da" />
        </mesh>,
      );
    }
  }
  return edificios;
}

export default function Ciudad3D({ datos, destino, onElegirDestino }) {
  function elegir(e) {
    if (e.delta > 4) return; // fue un arrastre para girar la cámara, no un clic
    onElegirDestino({ x: limitar(Math.round(e.point.x)), y: limitar(Math.round(e.point.z)) });
  }

  return (
    <Canvas camera={{ position: [4, 8, 12], fov: 50 }}>
      <color attach="background" args={["#495057"]} />
      <ambientLight intensity={1.5} />
      <directionalLight position={[5, 10, 5]} intensity={2} />
      <OrbitControls target={[4, 0, 4]} />

      {/* Suelo: al hacer clic se elige la esquina más cercana como destino */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[4, 0, 4]} onClick={elegir}>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#495057" />
      </mesh>
      <gridHelper args={[8, 8, "white", "white"]} position={[4, 0.01, 4]} />
      <Edificios />

      {datos.restaurantes.map((r) => (
        <Pin key={r.nombre} x={r.x} y={r.y} color="red" texto={r.nombre} badge="danger" />
      ))}
      {datos.pedidos.filter((p) => p.estado !== "ENTREGADO").map((p) => (
        <Pin key={p.id} x={p.x} y={p.y} color="royalblue" texto={`#${p.id}`} badge="primary" />
      ))}
      {destino && <Pin x={destino.x} y={destino.y} color="limegreen" texto="Destino" badge="success" />}
      {datos.repartidores.map((r) => <Moto key={r.nombre} repartidor={r} />)}
    </Canvas>
  );
}
