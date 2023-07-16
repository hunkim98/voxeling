import React, { useMemo, useRef, useState } from "react";
import { ThreeElements } from "@react-three/fiber";
import { setSelectionRange } from "@testing-library/user-event/dist/utils";

interface Props {
  setSelectedPlaneIndex: React.Dispatch<React.SetStateAction<number | null>>;
  selectedPlaneIndex: number | null;
  planeIndex: number;
  scaleX?: number;
  scaleY?: number;
}

function Plane(props: ThreeElements["mesh"] & Props) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const [hovered, setHover] = useState(false);
  const isCurrentPlaneSelected = useMemo(
    () => props.selectedPlaneIndex === props.planeIndex,
    [props.selectedPlaneIndex, props.planeIndex]
  );
  return (
    <mesh
      {...props}
      ref={meshRef}
      onClick={(event) => {
        event.stopPropagation();
        props.setSelectedPlaneIndex(props.planeIndex);
      }}
      onPointerOver={(event) => {
        event.stopPropagation();
        setHover(true);
      }}
      onPointerOut={(event) => {
        event.stopPropagation();
        setHover(false);
      }}
      onPointerMissed={(event) => {
        event.stopPropagation();
        props.setSelectedPlaneIndex(null);
      }}
    >
      <planeGeometry args={[props.scaleX, props.scaleY]} />
      <meshStandardMaterial
        color={hovered || isCurrentPlaneSelected ? "orange" : "grey"}
        opacity={isCurrentPlaneSelected ? 0.7 : 0.3}
        transparent
      />
    </mesh>
  );
}

export default Plane;
