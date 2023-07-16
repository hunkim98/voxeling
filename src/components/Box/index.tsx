import { ThreeElements } from "@react-three/fiber";
import React, { useRef } from "react";

interface Props {
  planeIndex: number;
  selectedPlaneIndex: number | null;
}

function Box(props: Props & ThreeElements["mesh"]) {
  const meshRef = useRef<THREE.Mesh>(null!);
  //
  return (
    <mesh {...props} ref={meshRef}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial
        color={"red"}
        // opacity={props.selectedPlaneIndex !== props.planeIndex ? 0.5 : 1}
        // transparent
      />
    </mesh>
  );
}

export default Box;
