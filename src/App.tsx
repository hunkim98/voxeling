import logo from "./logo.svg";
import "./App.css";
import React, { useEffect, useRef, useState } from "react";
import { Canvas, ThreeElements } from "@react-three/fiber";
import {
  Dotting,
  DottingRef,
  PixelModifyItem,
  useData,
  useDotting,
  useGrids,
  GridIndices,
} from "dotting";
import { OrbitControls } from "@react-three/drei";
import Plane from "components/Plane";
import Box from "components/Box";

const DefaultDottingDataArray = [
  [
    { rowIndex: 0, columnIndex: 0, color: "" },
    { rowIndex: 0, columnIndex: 1, color: "" },
    { rowIndex: 0, columnIndex: 2, color: "" },
    { rowIndex: 0, columnIndex: 3, color: "" },
    { rowIndex: 0, columnIndex: 4, color: "" },
  ],
  [
    { rowIndex: 1, columnIndex: 0, color: "" },
    { rowIndex: 1, columnIndex: 1, color: "" },
    { rowIndex: 1, columnIndex: 2, color: "" },
    { rowIndex: 1, columnIndex: 3, color: "" },
    { rowIndex: 1, columnIndex: 4, color: "" },
  ],
  [
    { rowIndex: 2, columnIndex: 0, color: "" },
    { rowIndex: 2, columnIndex: 1, color: "" },
    { rowIndex: 2, columnIndex: 2, color: "" },
    { rowIndex: 2, columnIndex: 3, color: "" },
    { rowIndex: 2, columnIndex: 4, color: "" },
  ],
  [
    { rowIndex: 3, columnIndex: 0, color: "" },
    { rowIndex: 3, columnIndex: 1, color: "" },
    { rowIndex: 3, columnIndex: 2, color: "" },
    { rowIndex: 3, columnIndex: 3, color: "" },
    { rowIndex: 3, columnIndex: 4, color: "" },
  ],
];

function App() {
  const dottingRef = useRef<DottingRef>(null!);
  const { setData } = useDotting(dottingRef);
  useDotting(dottingRef);
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
    }>
  >([
    {
      data: DefaultDottingDataArray,
      indices: { leftColumnIndex: 0, topRowIndex: 0 },
    },
    {
      data: DefaultDottingDataArray,
      indices: { leftColumnIndex: 0, topRowIndex: 0 },
    },
  ]);

  const { dimensions, indices } = useGrids(dottingRef);
  const { dataArray } = useData(dottingRef);

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
    // if (previousSelectedPlaneIndex === null) return;
    if (previousSelectedPlaneIndex !== selectedPlaneIndex) {
      const modifiedData = dataArray.slice();
      if (!modifiedData[0] || !modifiedData[0][0]) return;
      const leftColumnIndex = modifiedData[0][0].columnIndex;
      const topRowIndex = modifiedData[0][0].rowIndex;
      setFloorDatas((prev) => {
        return prev.map((floorData, i) => {
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
              console.log("found identical", floorData.data);
              setData(floorData.data);
            }
            return floorData;
          }
        });
      });
    }
  }, [
    previousSelectedPlaneIndex,
    dataArray,
    setFloorDatas,
    selectedPlaneIndex,
    setData,
  ]);

  return (
    <div className="w-screen h-screen">
      <Canvas>
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
                            selectedPlaneIndex={selectedPlaneIndex}
                            key={i + "-" + dot.rowIndex + "-" + dot.columnIndex}
                            position={[
                              dot.columnIndex +
                                floorData.indices.leftColumnIndex +
                                0.5,
                              i,
                              dot.rowIndex +
                                floorData.indices.topRowIndex +
                                0.5,
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
              <group>
                {row.map((dot, j) => {
                  if (dot.color !== "") {
                    return (
                      <Box
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
                          dot.columnIndex + indices.leftColumnIndex + 0.5,
                          selectedPlaneIndex,
                          dot.rowIndex + indices.topRowIndex + 0.5,
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
        <OrbitControls target={[0, 0, 0]} />
      </Canvas>
      <div className="absolute bottom-0">
        <div className="relative flex flex-col w-[300px] h-[300px] rounded-md overflow-hidden ml-3 mb-3">
          <Dotting
            ref={dottingRef}
            width={"100%"}
            height={"100%"}
            style={{ border: 0 }}
            backgroundColor="#dddddd"
            backgroundMode="color"
          />
          {selectedPlaneIndex === null && (
            <div className="absolute w-full h-full bg-gray-200">
              <div className="absolute w-[150px] text-center m-auto left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]">
                Please select a plane to edit
              </div>
            </div>
          )}
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
