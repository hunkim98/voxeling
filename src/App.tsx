import logo from "./logo.svg";
import "./App.css";
import React, { useContext, useEffect, useRef, useState } from "react";
import { Canvas, ThreeElements, useThree } from "@react-three/fiber";
import {
  Dotting,
  DottingRef,
  PixelModifyItem,
  useData,
  useDotting,
  useGrids,
  GridIndices,
  useHandlers,
} from "dotting";
import { OrbitControls } from "@react-three/drei";
import Plane from "components/Plane";
import Box from "components/Box";
import Layers from "components/Layers";
import { DefaultLayerData } from "utils/config";
import Control from "components/Control";
import { Raycaster } from "three";
import { ViewContext } from "context/ViewContext";
import {
  rotateMatrixClockwiseBy,
  rotateMatrixCounterClockwiseBy,
} from "utils/matrix/rotate";

// https://github.com/timoxley/threejs/blob/master/examples/webgl_interactive_voxelpainter.html

function App() {
  const dottingRef = useRef<DottingRef>(null!);
  const { setData } = useDotting(dottingRef);
  const { cameraViewingFrom } = useContext(ViewContext);
  const { addHoverPixelChangeListener, removeHoverPixelChangeListener } =
    useHandlers(dottingRef);
  const [isPlaneVisible, setIsPlaneVisible] = useState(true);
  const [selectedPlaneIndex, setSelectedPlaneIndex] = useState<null | number>(
    null
  );
  const [previousSelectedPlaneIndex, setPreviousSelectedPlaneIndex] = useState<
    null | number
  >(null);
  const [floorDatas, setFloorDatas] = useState<
    Array<{
      data: Array<Array<PixelModifyItem>>;
      indices: {
        leftColumnIndex: number;
        topRowIndex: number;
      };
      id: number;
    }>
  >([
    {
      data: DefaultLayerData,
      indices: { leftColumnIndex: 0, topRowIndex: 0 },
      id: 0,
    },
    {
      data: DefaultLayerData,
      indices: { leftColumnIndex: 0, topRowIndex: 0 },
      id: 1,
    },
  ]);

  const { dimensions, indices } = useGrids(dottingRef);
  const { dataArray } = useData(dottingRef);

  useEffect(() => {
    if (selectedPlaneIndex !== null) {
    }
  }, [addHoverPixelChangeListener, removeHoverPixelChangeListener]);

  useEffect(() => {
    if (previousSelectedPlaneIndex !== selectedPlaneIndex) {
      setPreviousSelectedPlaneIndex(selectedPlaneIndex);
    }
  }, [
    selectedPlaneIndex,
    setPreviousSelectedPlaneIndex,
    previousSelectedPlaneIndex,
  ]);

  // when the user clicks on a plane,
  // we want to transfer dotting data into floorDatas
  useEffect(() => {
    if (previousSelectedPlaneIndex !== selectedPlaneIndex) {
      const modifiedData = dataArray.slice();

      if (!modifiedData[0] || !modifiedData[0][0]) return;

      let leftColumnIndex = modifiedData[0][0].columnIndex;
      let topRowIndex = modifiedData[0][0].rowIndex;

      setFloorDatas((prev) => {
        const floorData = prev.map((floorData, i) => {
          // we first store the modified data to our floor data
          if (i === previousSelectedPlaneIndex) {
            return {
              ...floorData,
              data: modifiedData,
              indices: {
                leftColumnIndex,
                topRowIndex,
              },
            };
          } else {
            if (i === selectedPlaneIndex) {
              setData(floorData.data);
            }
            return floorData;
          }
        });
        return floorData;
      });
    }
  }, [
    previousSelectedPlaneIndex,
    dataArray,
    setFloorDatas,
    selectedPlaneIndex,
    setData,
    cameraViewingFrom,
  ]);

  return (
    <div className="w-screen h-screen">
      <Canvas frameloop="demand">
        <ambientLight />
        <pointLight position={[10, 10, 10]} />
        <group visible={isPlaneVisible}>
          {floorDatas.map((floorData, i) => {
            if (i === selectedPlaneIndex) return null;
            return (
              <Plane
                key={i}
                position={[
                  floorData.indices.leftColumnIndex +
                    floorData.data[0].length / 2,
                  -0.5 + i + 0.01,
                  floorData.indices.topRowIndex + floorData.data.length / 2,
                ]}
                rotation={[Math.PI * -0.5, 0, 0]}
                scaleX={floorData.data[0].length}
                scaleY={floorData.data.length}
                planeIndex={i}
                setSelectedPlaneIndex={setSelectedPlaneIndex}
                selectedPlaneIndex={selectedPlaneIndex}
              />
            );
          })}
          {selectedPlaneIndex !== null && indices && dimensions && (
            <Plane
              position={[
                indices.leftColumnIndex + dimensions.columnCount / 2,
                -0.5 + selectedPlaneIndex + 0.01,
                indices.topRowIndex + dimensions.rowCount / 2,
              ]}
              rotation={[Math.PI * -0.5, 0, 0]}
              scaleX={dimensions.columnCount}
              scaleY={dimensions.rowCount}
              planeIndex={selectedPlaneIndex}
              setSelectedPlaneIndex={setSelectedPlaneIndex}
              selectedPlaneIndex={selectedPlaneIndex}
            />
          )}
        </group>
        {floorDatas.map((floorData, i) => {
          if (i === selectedPlaneIndex) {
            return null;
          }
          return (
            <group key={"floor-boxes-" + i}>
              {floorData.data.map((row, rowIndex) => {
                return (
                  <group key={"array-" + rowIndex}>
                    {row.map((dot, j) => {
                      if (dot.color !== "") {
                        return (
                          <Box
                            planeIndex={i}
                            userData={{
                              floorIdx: i,
                              columnIndex: dot.columnIndex,
                              rowIndex: dot.rowIndex,
                            }}
                            selectedPlaneIndex={selectedPlaneIndex}
                            key={i + "-" + dot.rowIndex + "-" + dot.columnIndex}
                            position={[
                              dot.columnIndex + 0.5,
                              i,
                              dot.rowIndex + 0.5,
                            ]}
                          />
                        );
                      } else {
                        return null;
                      }
                    })}
                  </group>
                );
              })}
            </group>
          );
        })}
        {selectedPlaneIndex !== null &&
          dataArray.map((row, i) => {
            return (
              // this is for temporary purposes
              <group key={i}>
                {row.map((dot, j) => {
                  if (dot.color !== "") {
                    return (
                      <Box
                        userData={{
                          floorIdx: selectedPlaneIndex,
                          columnIndex: dot.columnIndex,
                          rowIndex: dot.rowIndex,
                        }}
                        planeIndex={selectedPlaneIndex}
                        selectedPlaneIndex={selectedPlaneIndex}
                        key={
                          "interaction_" +
                          selectedPlaneIndex +
                          "-" +
                          dot.rowIndex +
                          "-" +
                          dot.columnIndex
                        }
                        position={[
                          dot.columnIndex + 0.5,
                          selectedPlaneIndex,
                          dot.rowIndex + 0.5,
                        ]}
                      />
                    );
                  } else {
                    return null;
                  }
                })}
              </group>
            );
          })}
        <Control
          selectedPlaneIndex={selectedPlaneIndex}
          setSelectedPlaneIndex={setSelectedPlaneIndex}
          floorDatas={floorDatas}
        />
        {/* x is red, y is green, z is blue */}
        <axesHelper args={[5]} />
      </Canvas>

      <div className="absolute bottom-0">
        <div
          className={`relative ${
            cameraViewingFrom.cameraRotateDegree === 270
              ? "-rotate-90"
              : `rotate-${cameraViewingFrom.cameraRotateDegree}`
          } flex flex-col w-[300px] h-[300px] rounded-md overflow-hidden ml-3 mb-3`}
        >
          <Dotting
            ref={dottingRef}
            width={"100%"}
            height={"100%"}
            style={{ border: 0 }}
            backgroundColor="#dddddd"
          />
          {selectedPlaneIndex === null && (
            <div
              className={`absolute ${
                cameraViewingFrom.cameraRotateDegree === 270
                  ? "rotate-90"
                  : `-rotate-${cameraViewingFrom.cameraRotateDegree}`
              } w-full h-full bg-gray-200`}
            >
              <div className="absolute w-[150px] text-center m-auto left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]">
                Please select a plane to edit
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="absolute top-[50%] left-0 w-10 translate-y-[-50%] px-3 py-2">
        <Layers
          floorDatas={floorDatas}
          setFloorDatas={setFloorDatas}
          setSelectedPlaneIndex={setSelectedPlaneIndex}
          selectedPlaneIndex={selectedPlaneIndex}
        />
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
