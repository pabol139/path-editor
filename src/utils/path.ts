import type { Command, ParsePath } from "@/types/Path";
import type { Point } from "@/types/Point";
import { LINE_COMMANDS } from "@/constants/path";
import { commandHandlers } from "./command-handler";
import type { Viewbox } from "@/types/Viewbox";
import type { SvgDimensions } from "@/types/Svg";
import type { Dispatch, SetStateAction } from "react";
import type { UpdateCommandsType } from "@/context/path-context";
import { isTouchDevice } from "./svg";

/** Regex based on https://github.com/Yqnn/svg-path-editor/blob/master/src/lib/path-parser.ts */
const kCommandTypeRegex = /^[\t\n\f\r ]*([MLHVZCSQTAmlhvzcsqta])[\t\n\f\r ]*/;
const kFlagRegex = /^[01]/;
const kNumberRegex =
  /^[+-]?(([0-9]*\.[0-9]+)|([0-9]+\.)|([0-9]+))([eE][+-]?[0-9]+)?/;
const kCoordinateRegex = kNumberRegex;
const kCommaWsp = /^(([\t\n\f\r ]+,?[\t\n\f\r ]*)|(,[\t\n\f\r ]*))/;

const kGrammar: { [key: string]: RegExp[] } = {
  M: [kCoordinateRegex, kCoordinateRegex],
  L: [kCoordinateRegex, kCoordinateRegex],
  H: [kCoordinateRegex],
  V: [kCoordinateRegex],
  C: [
    kCoordinateRegex,
    kCoordinateRegex,
    kCoordinateRegex,
    kCoordinateRegex,
    kCoordinateRegex,
    kCoordinateRegex,
  ],
  S: [kCoordinateRegex, kCoordinateRegex, kCoordinateRegex, kCoordinateRegex],
  Q: [kCoordinateRegex, kCoordinateRegex, kCoordinateRegex, kCoordinateRegex],
  T: [kCoordinateRegex, kCoordinateRegex],
  A: [
    kNumberRegex,
    kNumberRegex,
    kCoordinateRegex,
    kFlagRegex,
    kFlagRegex,
    kCoordinateRegex,
    kCoordinateRegex,
  ],
  Z: [],
};

export const parsePath = (path: string): ParsePath<number> => {
  let commands: ParsePath<number> = [];
  let i = 0;
  let count = 0;
  while (i < path.length) {
    const match = path.slice(i).match(kCommandTypeRegex);

    if (match === null)
      throw new Error("malformed path (first error at " + i + ")");

    const commandLetterWithSpaces = match[0];
    const commandLetter = match[1];

    if (i === 0 && commandLetter.toUpperCase() !== LINE_COMMANDS.MoveTo) {
      throw new Error("malformed path (first error at " + i + ")");
    }
    i = i + commandLetterWithSpaces.length;
    const [updatedI, updatedCommands, updatedCounter] = generateCommands(
      commandLetter,
      i,
      path,
      count
    );
    i = updatedI;
    count = updatedCounter;

    commands = [...commands, ...updatedCommands];
  }

  return commands;
};

const generateCommands = (
  commandLetter: string,
  i: number,
  path: string,
  count: number
): [number, ParsePath<number>, number] => {
  let regexTable = kGrammar[commandLetter.toUpperCase()] || [];
  const generatedCommands: ParsePath<number> = [];
  while (i <= path.length) {
    let j = 0;
    let coordinates: number[] = [];
    const command = {
      letter: commandLetter,
      coordinates: coordinates,
      hovered: false,
      selected: false,
      points: [],
      prevPoint: { x: 0, y: 0 },
    };
    while (j < regexTable.length) {
      let regex = regexTable[j];
      let newMatch = path.slice(i).match(regex);
      if (!newMatch) {
        if (coordinates.length === 0 && generatedCommands.length >= 1) {
          return [i, generatedCommands, count];
        } else throw new Error("malformed path (first error at " + i + ")");
      }

      coordinates.push(parseFloat(newMatch[0]));
      i = i + newMatch[0].length;

      while (path.slice(i).match(kCommaWsp)) {
        i++;
      }

      j++;
    }

    generatedCommands.push({
      ...command,
      id: count + command.letter,
    });
    count++;

    if (regexTable.length === 0) return [i, generatedCommands, count];

    // Case of: M 10 10 20 20 30 30 -> M 10 10 L 20 20 L 30 30
    if (commandLetter === LINE_COMMANDS.MoveTo) {
      commandLetter = LINE_COMMANDS.LineTo;
    }
    if (commandLetter === LINE_COMMANDS.MoveTo.toLocaleLowerCase()) {
      commandLetter = LINE_COMMANDS.LineTo.toLocaleLowerCase();
    }
  }

  throw new Error("malformed path (first error at " + i + ")");
};

export const formatNumberToString = (
  number: number,
  decimals: number
): string => {
  return String(Number(number.toFixed(decimals)));
};

export const getSvgCenter = (svgRef: React.RefObject<SVGSVGElement | null>) => {
  const path = svgRef?.current?.querySelector("path");
  if (!path) return { x: 0, y: 0 };
  const bbox = path.getBBox();

  let pathWidth = bbox.width;
  let pathHeight = bbox.height;
  let pathX = bbox.x;
  let pathY = bbox.y;

  const centerXAxis = pathX + pathWidth / 2;
  const centerYAxis = pathY + pathHeight / 2;

  return {
    x: centerXAxis,
    y: centerYAxis,
  };
};

export const centerViewbox = (
  svgRef: React.RefObject<SVGSVGElement | null>,
  viewboxSetter: (viewbox: Viewbox) => void,
  svgDimensionsSetter: Dispatch<SetStateAction<SvgDimensions>>
) => {
  if (!svgRef.current) return;
  const path = svgRef.current.querySelector("path");
  if (!path) return;

  const svgWidth = svgRef.current.getBoundingClientRect().width || 0;
  const svgHeight = svgRef.current.getBoundingClientRect().height || 0;
  const bbox = path.getBBox();

  let pathWidth = bbox.width || 2;
  let pathHeight = bbox.height || 2;
  let pathX = bbox.x;
  let pathY = bbox.y;
  const svgAspectRatio = svgHeight / svgWidth;
  const pathAspectRatio = pathHeight / pathWidth;
  if (svgAspectRatio < pathAspectRatio) {
    pathWidth = pathHeight / svgAspectRatio;
  } else {
    pathHeight = svgAspectRatio * pathWidth;
  }

  const percentFactorWidth = pathWidth * (isTouchDevice() ? 0.2 : 0.1);
  const percentFactorHeight = pathHeight * 0.1;

  // Center svg on screen
  pathX = pathX - (pathWidth + percentFactorWidth - bbox.width) / 2;
  pathY = pathY - (pathHeight + percentFactorHeight - bbox.height) / 2;

  viewboxSetter({
    x: pathX,
    y: pathY,
    width: pathWidth + percentFactorWidth,
    height: pathHeight + percentFactorHeight,
  });

  svgDimensionsSetter({
    width: svgRef.current.getBoundingClientRect().width || 0,
    height: svgRef.current.getBoundingClientRect().height || 0,
  });
};

export const getLastControlPoint = (
  commands: ParsePath<number>,
  currentIndex: number
): { x: number; y: number } | null => {
  // Look backwards for the last command that has a control point
  for (let i = currentIndex - 1; i >= 0; i--) {
    const command = commands[i];
    const { letter, points } = command;

    const handler = commandHandlers[letter.toLocaleUpperCase()];

    // If command is CloseTo, prevCommandCoordinates will be last Move To coordinates
    const prevCommandCoordinates = command.prevPoint;

    if (letter.toLocaleUpperCase() === LINE_COMMANDS.SmoothQuadraticCurve) {
      const prevControlPoint =
        letter.toLocaleUpperCase() === LINE_COMMANDS.SmoothCurve
          ? getLastControlPointCurve(commands, i)
          : getLastControlPoint(commands, i);

      if (prevControlPoint) {
        return {
          x: 2 * prevCommandCoordinates.x - prevControlPoint.x,
          y: 2 * prevCommandCoordinates.y - prevControlPoint.y,
        };
      }
    } else if (letter.toLocaleUpperCase() === LINE_COMMANDS.SmoothCurve) {
      return getLastControlPointCurve(commands, i);
    } else if (handler.getLastControlPoint) {
      return handler.getLastControlPoint(points);
    } else {
      if (letter.toLocaleUpperCase() === LINE_COMMANDS.Close) {
        return handler.getEndPosition(points);
      }

      return handler.getEndPosition(points);
    }
  }

  return null;
};

const getLastControlPointCurve = (
  commands: ParsePath<number>,
  currentIndex: number
) => {
  const command = commands[currentIndex];
  const { letter } = command;
  const handler = commandHandlers[letter.toLocaleUpperCase()];

  return handler?.getLastControlPoint?.(command.points) || null;
};

export const convertCommandsToPath = (commands: ParsePath<number>) => {
  return commands
    .map((command) => {
      if (command.letter.toUpperCase() === LINE_COMMANDS.Close) {
        return command.letter;
      }
      return (
        command.letter +
        " " +
        command.coordinates
          .map((coordinate) => formatNumberToString(coordinate, 2))
          .join(" ")
      );
    })
    .join(" ")
    .toString();
};

export const formatCommands: (
  commands: ParsePath<number>,
  precision: number
) => ParsePath<number> = (commands, precision = 2) => {
  return commands.map((command) => {
    return {
      ...command,
      coordinates: command.coordinates.map((coordinate) =>
        Number(coordinate.toFixed(precision))
      ),
    };
  });
};

export const translate = (
  commands: ParsePath<number>,
  x: string,
  y: string
) => {
  if (commands.length === 0) {
    return [];
  }

  const xValue = parseFloat(x);
  const yValue = parseFloat(y);

  if (isNaN(xValue) || isNaN(yValue)) {
    return commands;
  }

  const formatedCommands = commands.map((command, index) => {
    const { letter, coordinates } = command;

    if (letter.toLocaleUpperCase() === LINE_COMMANDS.Close) {
      return command;
    }
    const handler = commandHandlers[letter.toLocaleUpperCase()];
    const isRelative = isRelativeCommand(letter);
    const isFirstCommand = index === 0;
    const updatedCoordinates = handler.translate(
      coordinates,
      {
        x: xValue,
        y: yValue,
      },
      isRelative,
      isFirstCommand
    );

    return {
      ...command,
      coordinates: updatedCoordinates,
    };
  });

  return formatedCommands;
};

export const scale = (
  commands: ParsePath<number>,
  rawXFactor: string,
  rawYFactor: string
) => {
  if (commands.length === 0) {
    return [];
  }

  const xValue = parseFloat(rawXFactor);
  const yValue = parseFloat(rawYFactor);

  if (isNaN(xValue) || isNaN(yValue)) {
    return commands;
  }
  const formatedCommands = commands.map((command) => {
    const { letter, coordinates } = command;

    if (letter.toLocaleUpperCase() === LINE_COMMANDS.Close) {
      return command;
    }

    const handler = commandHandlers[letter.toLocaleUpperCase()];

    const updatedCoordinates = handler.scale(coordinates, {
      x: xValue,
      y: yValue,
    });

    return {
      ...command,
      coordinates: updatedCoordinates,
    };
  });

  return formatedCommands;
};

export const rotate = (
  commands: ParsePath<number>,
  rawXFactor: string,
  rawYFactor: string
) => {
  if (commands.length === 0) {
    return [];
  }

  const xValue = parseFloat(rawXFactor);
  const yValue = parseFloat(rawYFactor);

  if (isNaN(xValue) || isNaN(yValue)) {
    return commands;
  }
  const formatedCommands = commands.map((command) => {
    const { letter, coordinates } = command;

    if (letter.toLocaleUpperCase() === LINE_COMMANDS.Close) {
      return command;
    }

    const handler = commandHandlers[letter.toLocaleUpperCase()];

    const updatedCoordinates = handler.scale(coordinates, {
      x: xValue,
      y: yValue,
    });

    return {
      ...command,
      coordinates: updatedCoordinates,
    };
  });

  return formatedCommands;
};

export const isRelativeCommand = (commandLetter: string): boolean => {
  return commandLetter === commandLetter.toLowerCase();
};

export const generatePoints = (commands: ParsePath<number>) => {
  let previousCommand: Command<number> | null = null;
  let originPosition = { x: 0, y: 0 };
  let currentPosition = {
    x: 0,
    y: 0,
  };
  const commandsWithPoints = commands.map((command) => {
    const { letter, coordinates } = command;
    const handler = commandHandlers[command.letter.toUpperCase()];
    const isRelative = isRelativeCommand(command.letter);
    const isCloseCommand = letter.toUpperCase() === LINE_COMMANDS.Close;
    const isMoveToCommand = letter.toUpperCase() === LINE_COMMANDS.MoveTo;
    const isVertical = letter.toUpperCase() === LINE_COMMANDS.Vertical;
    const isHorizontal = letter.toUpperCase() === LINE_COMMANDS.Horizontal;

    let finalCommand = {
      ...command,
    };

    const prevPoint = {
      x:
        Number(
          previousCommand?.points[previousCommand.points.length - 1]?.cx
        ) || 0,
      y:
        Number(
          previousCommand?.points[previousCommand.points.length - 1]?.cy
        ) || 0,
    };

    currentPosition = isRelative ? prevPoint : { x: 0, y: 0 };
    //Convert command to absolute
    const [_, updatedCoordinates] = handler.toAbsolute(
      coordinates,
      currentPosition,
      isRelative
    );

    const newCoordinates = isCloseCommand
      ? [originPosition.x, originPosition.y]
      : isVertical
      ? [prevPoint.x, updatedCoordinates[0]]
      : isHorizontal
      ? [updatedCoordinates[0], prevPoint.y]
      : updatedCoordinates;

    const points = handler.extractPoints({
      ...command,
      coordinates: newCoordinates,
    });

    finalCommand.points = points;
    finalCommand.prevPoint = prevPoint;

    previousCommand = finalCommand;

    if (isMoveToCommand || isCloseCommand) {
      originPosition = finalCommand
        ? {
            x: Number(finalCommand.points[finalCommand.points.length - 1]?.cx),
            y: Number(finalCommand.points[finalCommand.points.length - 1]?.cy),
          }
        : originPosition;
      return finalCommand;
    }

    return finalCommand;
  });

  return commandsWithPoints;
};

export const convertToRadians = (angle: number) => angle * (Math.PI / 180);

export function convertCommandsRelativeToAbsolute(commands: ParsePath<number>) {
  return commands.map((command) => {
    const absoluteCommand = convertRelativeToAbsolute(command);
    return absoluteCommand;
  });
}
export function convertCommandsAbsoluteToRelative(commands: ParsePath<number>) {
  return commands.map((command) => {
    const relativeCommand = convertAbsoluteToRelative(command);
    return relativeCommand;
  });
}

export function convertAbsoluteToRelative(command: Command<number>) {
  const { letter, coordinates } = command;
  const currentPosition = command.prevPoint;

  if (letter.toLocaleUpperCase() === LINE_COMMANDS.Close)
    return { ...command, letter: letter.toLocaleLowerCase() };

  const handler = commandHandlers[letter.toLocaleUpperCase()];
  const isRelative = isRelativeCommand(letter);
  const [updatedLetter, updatedCoordinates] = handler.toRelative(
    coordinates,
    currentPosition,
    isRelative
  );

  return {
    ...command,
    letter: updatedLetter,
    coordinates: updatedCoordinates,
  };
}

export function createCommand(
  letter: string,
  position: { x: number; y: number },
  commands_counter: number
) {
  const handler = commandHandlers[letter.toLocaleUpperCase()];

  const newCommand = handler.create(position, commands_counter);

  return { ...newCommand };
}

export function convertRelativeToAbsolute(command: Command<number>) {
  const { letter, coordinates } = command;
  const currentPosition = command.prevPoint;

  if (letter.toLocaleUpperCase() === LINE_COMMANDS.Close)
    return { ...command, letter: letter.toLocaleUpperCase() };

  const handler = commandHandlers[letter.toLocaleUpperCase()];
  const isRelative = isRelativeCommand(letter);
  const [updatedLetter, updatedCoordinates] = handler.toAbsolute(
    coordinates,
    currentPosition,
    isRelative
  );

  return {
    ...command,
    letter: updatedLetter,
    coordinates: updatedCoordinates,
  };
}

export const updatePoints = (commands: ParsePath<number>) => {
  const points = commands.reduce(
    (acc, curr) => acc.concat(curr.points),
    [] as Point[]
  );

  return points;
};

export const onPointerEnterCommand = (
  commands: ParsePath<number>,
  updateCommands: UpdateCommandsType,
  id_command: string
) => {
  const newCommands = commands.map((command) => {
    if (command.id !== id_command) return { ...command, hovered: false };

    return { ...command, hovered: true };
  });

  updateCommands(newCommands, false);
};

export const onPointerLeaveCommand = (
  commands: ParsePath<number>,
  updateCommands: UpdateCommandsType
) => {
  const newCommands = commands.map((command) => {
    return { ...command, hovered: false };
  });
  updateCommands(newCommands, false);
};

export const onPointerDownCommand = (
  commands: ParsePath<number>,
  updateCommands: UpdateCommandsType,
  id_command: string,
  scrollIntoView: boolean = false,
  isSidebarOpen?: boolean
) => {
  const newCommands = commands.map((command) => {
    if (command.id !== id_command) return { ...command, selected: false };

    return { ...command, selected: true };
  });
  updateCommands(newCommands, false);
  scrollIntoView && scrollCommandIntoView(id_command, isSidebarOpen);
};

const scrollCommandIntoView = (
  id_command: string,
  isSidebarOpen: boolean = true
) => {
  if (!isSidebarOpen) return;

  const element = document.getElementById(`${id_command}`);
  element?.scrollIntoView({
    behavior: "smooth",
    block: "nearest",
    inline: "nearest",
  });
};

export const cleanSelectedAndHoveredCommands = (
  commands: ParsePath<number>
) => {
  return commands.map((command) => ({
    ...command,
    hovered: false,
    selected: false,
  }));
};
