import type { Line } from "@/types/Line";
import {
  convertCommandsRelativeToAbsolute,
  getCurrentPositionBeforeCommand,
  getLastControlPoint,
} from "./path";
import { LINE_COMMANDS } from "@/constants/path";
import type { Point } from "@/types/Point";
import type { Command } from "@/types/Path";

type LineCreator = (
  point: Point,
  points: Point[],
  commands: Command<number>[],
  pointIndex: number,
  commandIndex: number
) => Line[];

const getLineCreator = (letter: string) => {
  const creators: Record<string, LineCreator> = {
    [LINE_COMMANDS.Curve]: createCubicLines,
    [LINE_COMMANDS.QuadraticCurve]: createQuadraticLines,
    [LINE_COMMANDS.SmoothCurve]: createSmoothCubicLines,
    [LINE_COMMANDS.SmoothQuadraticCurve]: createSmoothQuadraticLines,
  };

  return creators[letter] || null;
};

export const createControlLines = (
  rawCommands: Command<number>[],
  points: Point[]
) => {
  const lines: Line[] = [];

  const commands = convertCommandsRelativeToAbsolute(rawCommands);

  points.forEach((point, index) => {
    const commandIndex = commands.findIndex(
      (command) => command.id === point.id_command
    );
    const command = commandIndex !== -1 ? commands[commandIndex] : undefined;
    if (!command) return [];

    const letter = command.letter.toLocaleUpperCase();

    const lineCreator = getLineCreator(letter);
    if (lineCreator) {
      const newLines = lineCreator(
        point,
        points,
        commands,
        index,
        commandIndex
      );
      lines.push(...newLines);
    }
  });

  return lines;
};

const createCubicLines: LineCreator = (
  point,
  points,
  commands,
  pointIndex,
  commandIndex
) => {
  const lines: Line[] = [];
  const { coordinate_index } = point;

  if (coordinate_index === 0 && commands[commandIndex - 1]) {
    let prevCommand = commands[commandIndex - 1];

    // Look for nearest MoveTo command if CloseTo is behind the curve
    if (prevCommand.letter.toLocaleUpperCase() === LINE_COMMANDS.Close) {
      let i = 2;
      while (prevCommand.letter.toLocaleUpperCase() !== LINE_COMMANDS.MoveTo) {
        prevCommand = commands[commandIndex - i];
        i++;
      }
    }

    const prevPoints = points.filter(
      (point) => point.id_command === prevCommand.id
    );

    lines.push({
      x1: prevPoints[prevPoints.length - 1].cx,
      y1: prevPoints[prevPoints.length - 1].cy,
      x2: point.cx,
      y2: point.cy,
    });
  } else if (coordinate_index === 2 && points[pointIndex + 1]) {
    lines.push({
      x1: points[pointIndex + 1].cx,
      y1: points[pointIndex + 1].cy,
      x2: point.cx,
      y2: point.cy,
    });
  } else if (coordinate_index === 4) {
    if (commands[commandIndex + 1]?.letter.toUpperCase() === "S") {
      const nextReflectionControlPoint = {
        x:
          2 * Number(points[pointIndex].cx) - Number(points[pointIndex - 1].cx),
        y:
          2 * Number(points[pointIndex].cy) - Number(points[pointIndex - 1].cy),
      };

      lines.push({
        x1: point.cx,
        y1: point.cy,
        x2: String(nextReflectionControlPoint.x),
        y2: String(nextReflectionControlPoint.y),
      });
    }
  }

  return lines;
};

const createQuadraticLines: LineCreator = (
  point,
  points,
  commands,
  pointIndex,
  commandIndex
) => {
  const lines: Line[] = [];
  const { coordinate_index } = point;

  let prevCommand = commands[commandIndex - 1];

  // Look for nearest MoveTo command if CloseTo is behind the curve
  if (prevCommand.letter.toLocaleUpperCase() === LINE_COMMANDS.Close) {
    let i = 2;
    while (prevCommand.letter.toLocaleUpperCase() !== LINE_COMMANDS.MoveTo) {
      prevCommand = commands[commandIndex - i];
      i++;
    }
  }

  const prevPoints = points.filter(
    (point) => point.id_command === prevCommand.id
  );
  if (coordinate_index === 0 && commands[commandIndex - 1]) {
    lines.push({
      x1: prevPoints[prevPoints.length - 1].cx,
      y1: prevPoints[prevPoints.length - 1].cy,
      x2: point.cx,
      y2: point.cy,
    });
  } else {
    lines.push({
      x1: points[pointIndex - 1].cx,
      y1: points[pointIndex - 1].cy,
      x2: points[pointIndex].cx,
      y2: points[pointIndex].cy,
    });

    if (commands[commandIndex + 1]?.letter.toUpperCase() === "T") {
      const nextReflectionControlPoint = {
        x:
          2 * Number(points[pointIndex].cx) - Number(points[pointIndex - 1].cx),
        y:
          2 * Number(points[pointIndex].cy) - Number(points[pointIndex - 1].cy),
      };

      lines.push({
        x1: point.cx,
        y1: point.cy,
        x2: String(nextReflectionControlPoint.x),
        y2: String(nextReflectionControlPoint.y),
      });
    }
  }

  return lines;
};

const createSmoothCubicLines: LineCreator = (
  point,
  points,
  commands,
  pointIndex,
  commandIndex
) => {
  const lines: Line[] = [];
  const { coordinate_index } = point;

  if (coordinate_index === 0) {
    lines.push({
      x1: points[pointIndex + 1].cx,
      y1: points[pointIndex + 1].cy,
      x2: point.cx,
      y2: point.cy,
    });

    if (commands[commandIndex + 1]?.letter.toUpperCase() === "S") {
      const nextReflectionControlPoint = {
        x:
          2 * Number(points[pointIndex + 1].cx) - Number(points[pointIndex].cx),
        y:
          2 * Number(points[pointIndex + 1].cy) - Number(points[pointIndex].cy),
      };

      lines.push({
        x1: point.cx,
        y1: point.cy,
        x2: String(nextReflectionControlPoint.x),
        y2: String(nextReflectionControlPoint.y),
      });
    }
  }

  return lines;
};

const createSmoothQuadraticLines: LineCreator = (
  point,
  _points,
  commands,
  _pointIndex,
  commandIndex
) => {
  const lines: Line[] = [];

  const prevControlPoint = getLastControlPoint(commands, commandIndex);
  if (!prevControlPoint) return lines;
  const prevCommandPosition = getCurrentPositionBeforeCommand(
    commands,
    commands[commandIndex].id
  );

  const prevReflectionControlPoint = {
    x: 2 * prevCommandPosition.x - prevControlPoint.x,
    y: 2 * prevCommandPosition.y - prevControlPoint.y,
  };

  if (
    commands[commandIndex - 1]?.letter.toUpperCase() === "Q" ||
    commands[commandIndex - 1]?.letter.toUpperCase() === "T"
  ) {
    lines.push({
      x1: String(prevReflectionControlPoint.x),
      y1: String(prevReflectionControlPoint.y),
      x2: point.cx,
      y2: point.cy,
    });
  }

  if (commands[commandIndex + 1]?.letter.toUpperCase() === "T") {
    const nextReflectionControlPoint = {
      x: 2 * Number(point.cx) - prevReflectionControlPoint.x,
      y: 2 * Number(point.cy) - prevReflectionControlPoint.y,
    };

    lines.push({
      x1: point.cx,
      y1: point.cy,
      x2: String(nextReflectionControlPoint.x),
      y2: String(nextReflectionControlPoint.y),
    });
  }

  return lines;
};
