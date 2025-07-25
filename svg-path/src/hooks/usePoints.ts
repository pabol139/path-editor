import { commandHandlers } from "@/utils/command-handler";
import {
  getCurrentPositionBeforeCommand,
  isRelativeCommand,
} from "@/utils/path";
import { Point as PointType } from "@/types/Point";
import { ParsePath, PathObject } from "@/types/Path";
import { UpdateCommandsType } from "@/context/PathContext";
import { useState } from "react";

type Coordinates = {
  id: string;
  x: number;
  y: number;
};

export default function usePoints(
  points: PointType[],
  pathObject: PathObject,
  store: (newPathObject: PathObject) => void,
  updateCommands: UpdateCommandsType
) {
  const [stateBeforeDragging, setStateBeforeDragging] = useState(pathObject);
  const { commands } = pathObject;
  const handleMove = (values: Coordinates, updateState: boolean) => {
    const pointInfo = points.find((point) => point.id === values.id);
    if (!pointInfo) return;

    if (updateState) setStateBeforeDragging(pathObject);

    const newCommands = commands.map((command) => {
      if (command.id !== pointInfo.id_command) return command; // Return unmodified command
      const coordinate_index = pointInfo.coordinate_index;
      const handler = commandHandlers[command.letter.toLocaleUpperCase()];

      // Current point position to convert absolute to relative and viceversa
      const currentPos = getCurrentPositionBeforeCommand(commands, command.id);

      const isRelative = isRelativeCommand(command.letter);
      // Create a new coordinates array to ensure immutability
      const newCoordinates = handler.updateCoordinates(
        command.coordinates,
        values.x,
        values.y,
        coordinate_index,
        currentPos,
        isRelative
      );

      return { ...command, coordinates: newCoordinates }; // Return new object
    });
    updateCommands(newCommands, false);
  };

  const handleUp = (hasMoved: boolean) => {
    if (hasMoved) store(stateBeforeDragging);
  };

  return { handleMove, handleUp };
}
