import { useState } from "react";
import { usePathObject } from "@/context/PathContext";
import {
  convertAbsoluteToRelative,
  convertRelativeToAbsolute,
  scale,
  translate,
} from "@/utils/path";
import { CollapsedSection } from "@/components/CollapsedSection";
import { TransformRow } from "@/components/transformations/TransformRow";
import React from "react";
import { MoveRight } from "lucide-react";

type Coordinates = {
  translate: AxisValues;
  rotate: AxisValues;
  scale: AxisValues;
};

type Axis = "x" | "y";

type AxisValues = {
  x: string;
  y: string;
};

type Action = "translate" | "rotate" | "scale";

function TransformSection() {
  const { pathObject, updateCommands } = usePathObject();

  const [coordinates, setCoordinates] = useState<Coordinates>({
    translate: {
      x: "0",
      y: "0",
    },
    rotate: {
      x: "0",
      y: "0",
    },
    scale: {
      x: "1",
      y: "1",
    },
  });

  const updatePosition = (action: Action, axis: Axis, value: string) => {
    var formattedValue = value.replace(/,/g, ".").replace(/[^0-9\.-]/g, "");
    setCoordinates((prev) => {
      return {
        ...prev,
        [action]: { ...prev[action], [axis]: formattedValue },
      };
    });
  };

  const handleTranslate = () => {
    updateCommands(
      translate(
        [...pathObject.commands],
        coordinates["translate"].x,
        coordinates["translate"].y
      )
    );
  };
  const handleRotate = () => {
    // updateCommands(
    //   rotate(path, coordinates["rotate"].x, coordinates["rotate"].y)
    // );
  };
  const handleScale = () => {
    updateCommands(
      scale(
        [...pathObject.commands],
        coordinates["scale"].x,
        coordinates["scale"].y
      )
    );
  };

  const handleRelativeToAbsolute = () => {
    updateCommands(convertRelativeToAbsolute(pathObject.commands));
  };
  const handleAbsoluteToRelative = () => {
    updateCommands(convertAbsoluteToRelative(pathObject.commands));
  };

  return (
    <CollapsedSection title="Operations">
      <div className="px-4 pb-5 space-y-4">
        <TransformRow
          title="Translate"
          action="translate"
          coordinates={coordinates}
          updatePosition={updatePosition}
          handleTransform={handleTranslate}
        ></TransformRow>
        <TransformRow
          title="Scale"
          action="scale"
          coordinates={coordinates}
          updatePosition={updatePosition}
          handleTransform={handleScale}
        ></TransformRow>
        <div className="flex gap-2 !mt-6">
          <button
            className="bg-purple border border-white rounded-md px-3 py-2 flex-1"
            onClick={handleRelativeToAbsolute}
          >
            m <MoveRight className="inline mx-2 "></MoveRight> M
          </button>
          <button
            className="bg-[#B15959] border border-white rounded-md px-3 py-2 flex-1"
            onClick={handleAbsoluteToRelative}
          >
            M <MoveRight className="inline mx-2 "></MoveRight> m
          </button>
        </div>
      </div>
    </CollapsedSection>
  );
}

export default React.memo(TransformSection);
