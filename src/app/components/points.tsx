import { commandHandlers } from "@/utils/command-handler";
import {
  getCurrentPositionBeforeCommand,
  isRelativeCommand,
  onPointerDownCommand,
  onPointerEnterCommand,
  onPointerLeaveCommand,
} from "@/utils/path";
import { Point } from "./point";
import { Point as PointType } from "@/types/Point";
import { ParsePath } from "@/types/Path";
import { Dispatch, SetStateAction } from "react";

type Coordinates = {
  id: string;
  x: number;
  y: number;
};

export default function Points({
  points,
  commands,
  updateCommands,
  viewboxWidth,
  svgDimensionsWidth,
}: {
  points: PointType[];
  commands: ParsePath<number>;
  updateCommands: (newValues: any) => void;
  viewboxWidth: number;
  svgDimensionsWidth: number;
}) {
  const handleMove = (values: Coordinates) => {
    const pointInfo = points.find((point) => point.id === values.id);
    if (!pointInfo) return;

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
    updateCommands(newCommands);
  };

  return (
    <>
      {points.map((point) => {
        return (
          <Point
            key={point.id}
            point={point}
            radius={String((3.5 * viewboxWidth) / svgDimensionsWidth)}
            strokeWidth={String((13 * viewboxWidth) / svgDimensionsWidth)}
            handleMove={handleMove}
            handleEnter={() =>
              onPointerEnterCommand(commands, updateCommands, point.id_command)
            }
            handleLeave={() => onPointerLeaveCommand(commands, updateCommands)}
            handleDown={() =>
              onPointerDownCommand(commands, updateCommands, point.id_command)
            }
          ></Point>
        );
      })}
    </>
  );
}
