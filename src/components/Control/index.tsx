import { OrbitControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { PixelModifyItem } from "dotting";
import React, { useEffect, useRef, useState } from "react";
import { Matrix3, Quaternion, Vector3 } from "three";
import { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { setRotationByAxis } from "utils/anlge";
import * as ML from "ml-matrix";
import { projectVector3On2DPlane } from "utils/projection";

//https://discourse.threejs.org/t/is-there-a-way-to-set-azimuth-and-polar-angles-for-orbitcontrols/14069/5

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
  const { camera, controls, scene } = useThree();
  const orbitControlsRef = useRef<OrbitControlsImpl>(null);
  const [capturedCameraPosition, setCapturedCameraPosition] = useState();
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

      // camera.applyQuaternion(new Quaternion(0, 0, 0, 1));
      // camera.lookAt(skewToRight, 0, 0);
      // position is object's local position
      if (orbitControlsRef.current) {
        orbitControlsRef.current.enabled = true;
        orbitControlsRef.current.target.lerp(
          new Vector3(skewToRight, 0, skewToBottom),
          0.1
        );
        orbitControlsRef.current.setAzimuthalAngle(0);
      } else {
      }
    }
  });

  useEffect(() => {
    if (!orbitControlsRef.current) {
      return;
    }
    const planeVector1 = new Vector3(1, 0, 0);
    const planeVector2 = new Vector3(0, 0, 1);
    const cameraDirection = new Vector3();
    camera.getWorldDirection(cameraDirection);
    const projectedVector = projectVector3On2DPlane({
      planeVector1,
      planeVector2,
      vectorToProject: cameraDirection,
    });
    const compareVector = new Vector3(0, 0, -1);
    const angle = projectedVector.angleTo(compareVector);
    const polarCoordinateX = Math.cos(angle + Math.PI / 4);
    const polarCoordinateY = Math.sin(angle + Math.PI / 4);
    if (polarCoordinateX >= 0 && polarCoordinateY >= 0) {
      console.log("bottom down");
    } else if (polarCoordinateX < 0 && polarCoordinateY >= 0) {
      console.log("right down");
    } else if (polarCoordinateX < 0 && polarCoordinateY < 0) {
      console.log("top down");
    } else if (polarCoordinateX >= 0 && polarCoordinateY < 0) {
      console.log("left down");
    }
    if (selectedPlaneIndex !== null) {
      orbitControlsRef.current.enableRotate = false;
    } else {
      orbitControlsRef.current.enableRotate = true;
    }
  }, [orbitControlsRef, selectedPlaneIndex, scene, camera]);
  return <OrbitControls ref={orbitControlsRef} target={[0, 0, 0]} />;
}

export default Control;
