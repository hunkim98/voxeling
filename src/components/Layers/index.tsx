import { PixelModifyItem } from "dotting";
import React from "react";
import { DefaultLayerData } from "utils/config";

interface Props {
  floorDatas: Array<{
    data: Array<Array<PixelModifyItem>>;
    indices: {
      leftColumnIndex: number;
      topRowIndex: number;
    };
    id: number;
  }>;
  setFloorDatas: React.Dispatch<
    React.SetStateAction<
      Array<{
        data: Array<Array<PixelModifyItem>>;
        indices: {
          leftColumnIndex: number;
          topRowIndex: number;
        };
        id: number;
      }>
    >
  >;
  selectedPlaneIndex: number | null;
  setSelectedPlaneIndex: React.Dispatch<React.SetStateAction<number | null>>;
}

function Layers(props: Props) {
  return (
    <div className="flex flex-col w-[300px]">
      <div className="flex justify-between">
        <h2 className="font-bold my-auto">Layers</h2>
        <button
          className="px-2 bg-blue-500 text-white font-bold rounded-lg py-0.5"
          onClick={() => {
            props.setFloorDatas([
              ...props.floorDatas,
              {
                data: DefaultLayerData,
                indices: {
                  leftColumnIndex:
                    props.floorDatas[props.floorDatas.length - 1].indices
                      .leftColumnIndex,
                  topRowIndex:
                    props.floorDatas[props.floorDatas.length - 1].indices
                      .topRowIndex,
                },
                id: props.floorDatas.length,
              },
            ]);
            props.setSelectedPlaneIndex(props.floorDatas.length);
          }}
        >
          + Add Layer
        </button>
      </div>
      {props.floorDatas
        .slice()
        .reverse()
        .map((floor) => (
          <button
            className="my-1"
            onClick={() => {
              props.setSelectedPlaneIndex(floor.id);
            }}
            key={floor.id}
          >
            Step {floor.id}
          </button>
        ))}
    </div>
  );
}

export default Layers;
