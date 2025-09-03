import type { Command, ParsePath } from "@/types/Path";
import { convertCommandsToPath, getLastControlPoint } from "./path";
import { LINE_COMMANDS } from "@/constants/path";
export type OverlappedPath = { color: string; overlappedPath: string };

export const createOverlappedPathsFromCommands = (
  commands: ParsePath<number>
) => {
  const overlappedPaths: OverlappedPath[] = [];
  commands.forEach((command, index) => {
    if (
      command.letter !== LINE_COMMANDS.MoveTo &&
      command.letter !== LINE_COMMANDS.Close &&
      (command.hovered || command.selected)
    ) {
      // let finalCommand: Command<number> | null = null;
      const prevPosition = command.prevPoint;

      const moveToCommand = {
        id: String(Math.random()),
        letter: "M",
        coordinates: [prevPosition.x, prevPosition.y],
        hovered: false,
        selected: false,
        points: [],
        prevPoint: { x: 0, y: 0 },
      };
      const finalCommand = transformCommand(
        command,
        commands,
        index,
        prevPosition
      );

      const color = command.selected
        ? "deeppink"
        : command.hovered
        ? "deepskyblue"
        : "white";
      overlappedPaths.push({
        color,
        overlappedPath:
          convertCommandsToPath([moveToCommand, finalCommand]) ?? "",
      });
    }
  });

  return overlappedPaths;
};

const transformCommand: (
  command: Command<number>,
  commands: ParsePath<number>,
  commandPosition: number,
  prevPosition: { x: number; y: number }
) => Command<number> = (command, commands, commandPosition, prevPosition) => {
  const letter = command.letter.toUpperCase();

  if (letter === "T") {
    return transformSmoothQuadratic(
      command,
      commands,
      commandPosition,
      prevPosition
    );
  }

  if (letter === "S") {
    return transformSmoothCubic(
      command,
      commands,
      commandPosition,
      prevPosition
    );
  }

  return command;
};

const transformSmoothQuadratic = (
  command: Command<number>,
  commands: ParsePath<number>,
  position: number,
  prevPosition: { x: number; y: number }
): Command<number> => {
  const controlPoint = calculateReflectedControlPoint(
    commands,
    position,
    prevPosition
  );

  return {
    ...command,
    letter: "Q",
    id: String(Math.random()),
    coordinates: [
      controlPoint.x,
      controlPoint.y,
      Number(command.points[0].cx),
      Number(command.points[0].cy),
    ],
  };
};

const transformSmoothCubic = (
  command: Command<number>,
  commands: ParsePath<number>,
  position: number,
  prevPosition: { x: number; y: number }
): Command<number> => {
  const controlPoint = calculateReflectedControlPoint(
    commands,
    position,
    prevPosition
  );

  return {
    ...command,
    letter: "C",
    id: String(Math.random()),
    coordinates: [
      controlPoint.x,
      controlPoint.y,
      Number(command.points[0].cx),
      Number(command.points[0].cy),
      Number(command.points[1].cx),
      Number(command.points[1].cy),
    ],
  };
};

const calculateReflectedControlPoint = (
  commands: ParsePath<number>,
  position: number,
  prevPosition: { x: number; y: number }
): { x: number; y: number } => {
  const prevControlPoint = getLastControlPoint(commands, position);

  if (prevControlPoint) {
    return {
      x: 2 * prevPosition.x - prevControlPoint.x,
      y: 2 * prevPosition.y - prevControlPoint.y,
    };
  }

  return prevPosition;
};
