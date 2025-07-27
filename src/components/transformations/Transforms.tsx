import { useState } from "react";
import { usePathObject } from "@/context/PathContext";
import {
  convertCommandsAbsoluteToRelative,
  convertCommandsRelativeToAbsolute,
  isRelativeCommand,
  scale,
  translate,
} from "@/utils/path";
import { CollapsedSection } from "@/components/collapsed-section";
import { TransformRow } from "@/components/transformations/TransformRow";
import React from "react";
import AnimatedButton from "../animated-button";

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
    if (
      coordinates["translate"].x !== "0" ||
      coordinates["translate"].y !== "0"
    ) {
      updateCommands(
        translate(
          [...pathObject.commands],
          coordinates["translate"].x,
          coordinates["translate"].y
        )
      );
    }
  };

  const handleScale = () => {
    if (coordinates["scale"].x !== "1" || coordinates["scale"].y !== "1") {
      updateCommands(
        scale(
          [...pathObject.commands],
          coordinates["scale"].x,
          coordinates["scale"].y
        )
      );
    }
  };

  const handleRelativeToAbsolute = () => {
    const hasRelativeCommands = pathObject.commands.some((command) =>
      isRelativeCommand(command.letter)
    );

    hasRelativeCommands &&
      updateCommands(convertCommandsRelativeToAbsolute(pathObject.commands));
  };
  const handleAbsoluteToRelative = () => {
    const hasAbsoluteCommands = pathObject.commands.some(
      (command) => !isRelativeCommand(command.letter)
    );

    hasAbsoluteCommands &&
      updateCommands(convertCommandsAbsoluteToRelative(pathObject.commands));
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
          <AnimatedButton onClick={handleRelativeToAbsolute} className="flex-1">
            To absolute
          </AnimatedButton>

          <AnimatedButton
            onClick={handleAbsoluteToRelative}
            className="flex-1"
            color={"bg-[#B15959]"}
            backgroundColor={"bg-[#b159594d]"}
          >
            To relative
          </AnimatedButton>
        </div>
      </div>
    </CollapsedSection>
  );
}

export default React.memo(TransformSection);
