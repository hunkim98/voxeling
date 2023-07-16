import logo from "./logo.svg";
import "./App.css";
import React, { useRef, useState } from "react";
import { Canvas, ThreeElements } from "@react-three/fiber";
import { Dotting, DottingRef } from "dotting";
import { OrbitControls } from "@react-three/drei";

function Box(props: ThreeElements["mesh"]) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const [hovered, setHover] = useState(false);
  const [active, setActive] = useState(false);
  // useFrame((state, delta) => (meshRef.current.rotation.x += delta));
  return (
    <mesh
      {...props}
      ref={meshRef}
      scale={active ? 1.5 : 1}
      onClick={(event) => setActive(!active)}
      onPointerOver={(event) => setHover(true)}
      onPointerOut={(event) => setHover(false)}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={hovered ? "hotpink" : "orange"} />
    </mesh>
  );
}

function Plane(props: ThreeElements["mesh"]) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const [hovered, setHover] = useState(false);
  const [active, setActive] = useState(false);
  return (
    <mesh
      {...props}
      ref={meshRef}
      scale={active ? 1.5 : 1}
      onClick={(event) => setActive(!active)}
      onPointerOver={(event) => setHover(true)}
      onPointerOut={(event) => setHover(false)}
    >
      <planeGeometry args={[2, 2]} />
      <meshStandardMaterial color="green" />
    </mesh>
  );
}

function App() {
  const dottingRef = useRef<DottingRef>(null!);
  return (
    <div className="w-screen h-screen">
      <Canvas>
        <ambientLight />
        <pointLight position={[10, 10, 10]} />
        <Box position={[-1.2, 0, 0]} />
        <Plane
          position={[0, -0.5, 0]}
          rotation={[Math.PI * -0.5, 0, 0]}
          scale={[1, 1, 1]}
        />
        <Box position={[1.2, 0, 0]} />
        <OrbitControls />
      </Canvas>
      <div className="absolute bottom-0">
        <div className="flex flex-col w-[300px] h-[300px] rounded-md overflow-hidden ml-3 mb-3">
          <Dotting
            ref={dottingRef}
            width={"100%"}
            height={"100%"}
            style={{ border: 0 }}
            backgroundColor="#dddddd"
            backgroundMode="color"
          />
        </div>
      </div>
    </div>
  );
}

export default App;
