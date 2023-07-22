import { OrbitControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { PixelModifyItem } from "dotting";
import React, { useEffect, useRef, useState } from "react";
import { Vector3 } from "three";
import { OrbitControls as OrbitControlsImpl } from "three-stdlib";

interface Props {
  selectedPlaneIndex: number | null;
  floorDatas: Array<{
    data: Array<Array<PixelModifyItem>>;
    indices: {
      leftColumnIndex: number;
      topRowIndex: number;
    };
    id: number;
  }>;
}

function Control({ selectedPlaneIndex, floorDatas }: Props) {
  const { camera, controls } = useThree();
  const orbitControlsRef = useRef<OrbitControlsImpl>(null);
  const [cameraDirection, setCameraDirection] = useState<Vector3>(
    new Vector3()
  );
  useEffect(() => {
    // camera.position.set(0, 5, 0);
  }, [camera]);
  useFrame((state, delta) => {
    // state.camera.position.set(0, 1, state.camera.position.z);
    if (selectedPlaneIndex !== null) {
      const { indices, data } = floorDatas[selectedPlaneIndex];
      const columnLength = data[0].length;
      const rowLength = data.length;
      const { leftColumnIndex, topRowIndex } = indices;
      const skewToRight = leftColumnIndex + columnLength / 2;
      const skewToBottom = topRowIndex + rowLength / 2;
      // camera.position.lerp()
      camera.position.lerp(new Vector3(skewToRight, 10, skewToBottom), 0.1);
      // camera.lookAt(skewToRight, 0, 0);
      // position is object's local position
      if (orbitControlsRef.current) {
        orbitControlsRef.current.target.lerp(
          new Vector3(skewToRight, 0, skewToBottom),
          0.1
        );
        orbitControlsRef.current.update();
      }
    }
  });
  // useEffect(() => {
  //   const vector = new Vector3();
  //   camera.getWorldDirection(vector);
  //   setCameraDirection(vector);
  //   if (selectedPlaneIndex !== null) {
  //     // camera.lookAt(0, 0, 0);
  //     if (orbitControlsRef.current) {
  //       orbitControlsRef.current.update();
  //     }
  //   }
  //   // camera.updateMatrixWorld();
  //   console.log(camera.position);
  //   // camera.position.lerp(new Vector3(0, 0, 0), 0.1);
  //   // camera.position.set(0, camera.position.y, camera.position.z);
  // }, [selectedPlaneIndex, camera, controls]);
  return <OrbitControls ref={orbitControlsRef} target={[0, 0, 0]} />;
}

export default Control;
