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
  const bottomOrientationRef = useRef<0 | 1 | 2 | 3 | null>(null); // we will apply bitwise operation to this value
  useEffect(() => {
    // camera.position.set(0, 5, 0);
  }, [camera]);
  useFrame((state, delta) => {
    // state.camera.position.set(0, 1, state.camera.position.z);
    if (selectedPlaneIndex !== null && bottomOrientationRef.current !== null) {
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
        console.log(bottomOrientationRef.current);
        orbitControlsRef.current.setAzimuthalAngle(
          (bottomOrientationRef.current * Math.PI) / 2
        );
      } else {
      }
    }
  });

  useEffect(() => {
    if (!orbitControlsRef.current) {
      return;
    }

    if (selectedPlaneIndex !== null) {
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
      const cos =
        projectedVector.dot(compareVector) /
        (projectedVector.length() * compareVector.length());
      const orientation =
        compareVector.x * projectedVector.z -
        compareVector.z * projectedVector.x;

      const angle = Math.acos(cos);
      // const angle = projectedVector.angleTo(compareVector);
      const correctedAngle = orientation > 0 ? 2 * Math.PI - angle : angle;
      // const degree = (correctedAngle * 180) / Math.PI;
      const polarCoordinateX = Math.cos(correctedAngle + Math.PI / 4);
      const polarCoordinateY = Math.sin(correctedAngle + Math.PI / 4);
      if (polarCoordinateX >= 0 && polarCoordinateY >= 0) {
        // console.log("bottom down");
        bottomOrientationRef.current = 0;
      } else if (polarCoordinateX < 0 && polarCoordinateY >= 0) {
        // console.log("right down");
        bottomOrientationRef.current = 1;
      } else if (polarCoordinateX < 0 && polarCoordinateY < 0) {
        // console.log("top down");
        bottomOrientationRef.current = 2;
      } else if (polarCoordinateX >= 0 && polarCoordinateY < 0) {
        // console.log("left down");
        bottomOrientationRef.current = 3;
      }
      orbitControlsRef.current.enableRotate = false;
    } else {
      orbitControlsRef.current.enableRotate = true;
      bottomOrientationRef.current = null;
    }
  }, [orbitControlsRef, selectedPlaneIndex, scene, camera]);
  return <OrbitControls ref={orbitControlsRef} target={[0, 0, 0]} />;
}

export default Control;
