import logo from "./logo.svg";
import "./App.css";
import React, { useEffect, useRef, useState } from "react";
import { Canvas, ThreeElements } from "@react-three/fiber";
import { Dotting, DottingRef, useData, useDotting, useGrids } from "dotting";
import { OrbitControls } from "@react-three/drei";

function Box(props: ThreeElements["mesh"]) {
  const meshRef = useRef<THREE.Mesh>(null!);
  // useFrame((state, delta) => (meshRef.current.rotation.x += delta));
  return (
    <mesh {...props} ref={meshRef}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={"red"} />
    </mesh>
  );
}

function Plane(
  props: ThreeElements["mesh"] & { scaleX?: number; scaleY?: number }
) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const [hovered, setHover] = useState(false);
  const [active, setActive] = useState(false);
  return (
    <mesh
      {...props}
      ref={meshRef}
      // onClick={(event) => setActive(!active)}
      onPointerOver={(event) => setHover(true)}
      onPointerOut={(event) => setHover(false)}
    >
      <planeGeometry args={[props.scaleX, props.scaleY]} />
      <meshStandardMaterial color={active ? "orange" : "grey"} />
    </mesh>
  );
}

function App() {
  const dottingRef = useRef<DottingRef>(null!);
  useDotting(dottingRef);
  const [isPlaneVisible, setIsPlaneVisible] = useState(true);

  const { dimensions } = useGrids(dottingRef);
  const { dataArray } = useData(dottingRef);

  return (
    <div className="w-screen h-screen">
      <Canvas>
        <ambientLight />
        <pointLight position={[10, 10, 10]} />
        <group visible={isPlaneVisible}>
          <Plane
            position={[0, -0.5, 0]}
            rotation={[Math.PI * -0.5, 0, 0]}
            scaleX={dimensions.columnCount}
            scaleY={dimensions.rowCount}
          />
        </group>
        <group>
          {dataArray.map((row, i) => {
            return row.map((dot, j) => {
              if (dot.color !== "") {
                return (
                  <Box
                    position={[
                      j - dimensions.columnCount / 2 + 0.5,
                      0,
                      i - dimensions.rowCount / 2 + 0.5,
                    ]}
                  />
                );
              } else {
                return null;
              }
            });
          })}
        </group>
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
      <div className="absolute top-0 w-full flex justify-center mt-3">
        <button
          className="rounded-md border-gray-400 border-2 px-3 py-2 border-solid"
          onClick={() => setIsPlaneVisible(!isPlaneVisible)}
        >
          Hide Guide Planes
        </button>
      </div>
    </div>
  );
}

export default App;
