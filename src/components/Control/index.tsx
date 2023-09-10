import { OrbitControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { PixelModifyItem } from "dotting";
import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  Matrix3,
  Quaternion,
  Raycaster,
  Vector3,
  ZeroCurvatureEnding,
} from "three";
import { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { setRotationByAxis } from "utils/anlge";
import * as ML from "ml-matrix";
import { projectVector3On2DPlane } from "utils/projection";
import { radToDeg } from "three/src/math/MathUtils";
import { ViewContext } from "context/ViewContext";

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
  const { camera, controls, scene, gl } = useThree();
  const orbitControlsRef = useRef<OrbitControlsImpl>(null);
  const bottomOrientationRef = useRef<0 | 1 | 2 | 3 | null>(null); // we will apply bitwise operation to this value
  const rayCaster = useRef<Raycaster>(new Raycaster());
  const { setCameraViewingFrom } = useContext(ViewContext);
  useEffect(() => {
    // camera.position.set(0, 5, 0);
    const onMouseDown = (event: MouseEvent) => {
      const clientWidth = gl.domElement.clientWidth;
      const clientHeight = gl.domElement.clientHeight;
      const mousePos = {
        x: (event.clientX / clientWidth) * 2 - 1,
        y: -(event.clientY / clientHeight) * 2 + 1,
      } as THREE.Vector2;
      rayCaster.current.setFromCamera(mousePos, camera);
      const intersects = rayCaster.current.intersectObjects(scene.children);
      if (intersects.length > 0) {
        const intersect = intersects[0];
        const { object } = intersect;
        if (object.type === "AxesHelper") {
          return;
        } else {
        }
        const { name } = object;
        if (name === "plane") {
          if (selectedPlaneIndex === null) return;
          const { columnIndex, rowIndex } = object.userData;
          const { indices } = floorDatas[selectedPlaneIndex];
          const { leftColumnIndex, topRowIndex } = indices;
          const columnLength = floorDatas[selectedPlaneIndex].data[0].length;
          const rowLength = floorDatas[selectedPlaneIndex].data.length;
          const columnOffset = columnIndex - leftColumnIndex;
          const rowOffset = rowIndex - topRowIndex;
          const modifiedData = floorDatas[selectedPlaneIndex].data.slice();
          for (let i = 0; i < rowLength; i++) {
            for (let j = 0; j < columnLength; j++) {
              if (
                modifiedData[i + rowOffset] &&
                modifiedData[i + rowOffset][j + columnOffset]
              ) {
                modifiedData[i + rowOffset][j + columnOffset].color = "red";
              }
            }
          }
        }
      }
    };
    gl.domElement.addEventListener("mousedown", onMouseDown);
    return () => {
      gl.domElement.removeEventListener("mousedown", onMouseDown);
    };
  }, []);
  const floorData = useRef<{
    data: Array<Array<PixelModifyItem>>;
    indices: {
      leftColumnIndex: number;
      topRowIndex: number;
    };
  }>(
    selectedPlaneIndex !== null
      ? floorDatas[selectedPlaneIndex]
      : {
          data: [],
          indices: {
            leftColumnIndex: 0,
            topRowIndex: 0,
          },
        }
  );
  useEffect(() => {
    if (selectedPlaneIndex !== null) {
      floorData.current = floorDatas[selectedPlaneIndex];
    }
  }, [selectedPlaneIndex, floorDatas]);

  const cameraLerp = useMemo(() => new Vector3(), []); // for Garbage Collection optimization
  const orbitControlTargetLerp = useMemo(() => new Vector3(), []);
  useFrame((state, delta) => {
    // state.camera.position.set(0, 1, state.camera.position.z);
    if (selectedPlaneIndex !== null && bottomOrientationRef.current !== null) {
      const { indices, data } = floorData.current;
      const columnLength = data[0].length;
      const rowLength = data.length;
      const { leftColumnIndex, topRowIndex } = indices;
      const skewToRight = leftColumnIndex + columnLength / 2;
      const skewToBottom = topRowIndex + rowLength / 2;
      // camera.position.lerp()
      state.camera.position.lerp(
        cameraLerp.set(skewToRight, 10, skewToBottom),
        0.1
      );

      // camera.applyQuaternion(new Quaternion(0, 0, 0, 1));
      // camera.lookAt(skewToRight, 0, 0);
      // position is object's local position
      if (orbitControlsRef.current) {
        orbitControlsRef.current.enabled = true;
        orbitControlsRef.current.target.lerp(
          orbitControlTargetLerp.set(skewToRight, 0, skewToBottom),
          0.1
        );
        console.log(
          radToDeg((bottomOrientationRef.current * Math.PI) / 2),
          "rotaion"
        );
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
        setCameraViewingFrom((prev) => ({
          viewingFrom: prev.viewingFrom,
          cameraRotateDegree: 0,
        }));
      } else if (polarCoordinateX < 0 && polarCoordinateY >= 0) {
        // console.log("right down");
        bottomOrientationRef.current = 1;
        setCameraViewingFrom((prev) => ({
          viewingFrom: prev.viewingFrom,
          cameraRotateDegree: 90,
        }));
      } else if (polarCoordinateX < 0 && polarCoordinateY < 0) {
        // console.log("top down");
        bottomOrientationRef.current = 2;
        setCameraViewingFrom((prev) => ({
          viewingFrom: prev.viewingFrom,
          cameraRotateDegree: 180,
        }));
      } else if (polarCoordinateX >= 0 && polarCoordinateY < 0) {
        // console.log("left down");
        bottomOrientationRef.current = 3;
        setCameraViewingFrom((prev) => ({
          viewingFrom: prev.viewingFrom,
          cameraRotateDegree: 270,
        }));
      }
      orbitControlsRef.current.enableRotate = false;
    } else {
      orbitControlsRef.current.enableRotate = true;
      bottomOrientationRef.current = null;
    }
  }, [
    orbitControlsRef,
    selectedPlaneIndex,
    scene,
    camera,
    setCameraViewingFrom,
  ]);

  return <OrbitControls ref={orbitControlsRef} target={[0, 0, 0]} />;
}

export default Control;
