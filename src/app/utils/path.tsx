import { Command, ParsePath } from "@/types/Path";
import { Point } from "@/types/Point";
import { LINE_COMMANDS } from "@/constants/path";
import { commandHandlers } from "./command-handler";

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
    const [updatedI, updatedCommands] = generateCommands(
      commandLetter,
      i,
      path
    );
    i = updatedI;

    commands = [...commands, ...updatedCommands];
  }

  return commands;
};

const generateCommands = (
  commandLetter: string,
  i: number,
  path: string
): [number, ParsePath<number>] => {
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
    };
    while (j < regexTable.length) {
      let regex = regexTable[j];
      let newMatch = path.slice(i).match(regex);
      if (!newMatch) {
        if (coordinates.length === 0 && generatedCommands.length >= 1) {
          return [i, generatedCommands];
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
      id: crypto.randomUUID(),
    });

    if (regexTable.length === 0) return [i, generatedCommands];
  }

  throw new Error("malformed path (first error at " + i + ")");
};

export const getPathBBox = (path: string) => {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  const pathElement = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "path"
  );
  pathElement.setAttribute("d", path);
  svg.appendChild(pathElement);
  document.body.appendChild(svg);
  const BBox = pathElement?.getBBox();
  document.body.removeChild(svg);

  return BBox;
};

export const formatNumber = (number: number, decimals: number): string => {
  return number
    .toFixed(decimals)
    .replace(/^(-?[0-9]*\.([0-9]*[1-9])?)0*$/, "$1") // Search for meaningful decimals (non zero)
    .replace(/\.$/, ""); // Removes any trailing point
};

export const centerViewbox = (svgRef, viewboxSetter, svgDimensionsSetter) => {
  const path = svgRef.current?.querySelector("path");
  if (!path) return;

  const svgWidth = svgRef.current.getBoundingClientRect().width || 0;
  const svgHeight = svgRef.current.getBoundingClientRect().height || 0;
  const bbox = path.getBBox();

  let pathWidth = bbox.width;
  let pathHeight = bbox.height;
  let pathX = bbox.x;
  let pathY = bbox.y;
  const svgAspectRatio = svgHeight / svgWidth;
  const pathAspectRatio = pathHeight / pathWidth;
  if (svgAspectRatio < pathAspectRatio) {
    pathWidth = pathHeight / svgAspectRatio;
  } else {
    pathHeight = svgAspectRatio * pathWidth;
  }

  const percentFactorWidth = pathWidth * 0.1;
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

export const createPathFromHoveredCommands = (commands: ParsePath<number>) => {
  let commandPosition = 0;

  const absoluteCommands = convertRelativeToAbsolute(commands);
  const command = absoluteCommands.find((command, index) => {
    if (command.hovered === true) {
      commandPosition = index;
      return true;
    }
    return false;
  });
  let finalCommand = {};

  if (!command || command.letter.toUpperCase() === "M" || commandPosition === 0)
    return "";

  const prevCommand = getCurrentPositionBeforeCommand(
    absoluteCommands,
    command.id
  );

  const moveToCommand = {
    coordinates: [prevCommand.x, prevCommand.y],
    id: String(Math.random()),
    letter: "M",
  };

  if (command.letter.toUpperCase() === "T") {
    const prevControlPoint = getLastControlPoint(
      absoluteCommands,
      commandPosition
    );
    let controlPoint;

    if (prevControlPoint) {
      // Calculate the reflected control point
      controlPoint = {
        x: 2 * prevCommand.x - prevControlPoint.x,
        y: 2 * prevCommand.y - prevControlPoint.y,
      };
    } else {
      // If no previous control point, the control point is the current position
      controlPoint = { x: prevCommand.x, y: prevCommand.y };
    }

    finalCommand = {
      letter: "Q",
      id: String(Math.random()),
      coordinates: [
        controlPoint.x,
        controlPoint.y,
        command.coordinates[0],
        command.coordinates[1],
      ],
    };
  } else if (command.letter.toUpperCase() === "S") {
    const prevControlPoint = getLastControlPoint(
      absoluteCommands,
      commandPosition
    );

    let controlPoint;

    if (prevControlPoint) {
      // Calculate the reflected control point
      controlPoint = {
        x: 2 * prevCommand.x - prevControlPoint.x,
        y: 2 * prevCommand.y - prevControlPoint.y,
      };
    } else {
      // If no previous control point, the control point is the current position
      controlPoint = { x: prevCommand.x, y: prevCommand.y };
    }
    console.log(command.coordinates);

    finalCommand = {
      letter: "C",
      id: String(Math.random()),
      coordinates: [
        controlPoint.x,
        controlPoint.y,
        command.coordinates[0],
        command.coordinates[1],
        command.coordinates[2],
        command.coordinates[3],
      ],
    };
  } else {
    finalCommand = command;
  }
  return convertPathToString([moveToCommand, finalCommand]) ?? "";
};

export const getLastControlPoint = (commands: any, currentIndex: number) => {
  // Look backwards for the last command that has a control point
  for (let i = currentIndex - 1; i >= 0; i--) {
    const command = commands[i];
    switch (command.letter.toUpperCase()) {
      case "Q":
        return {
          x: command.coordinates[0],
          y: command.coordinates[1],
        };
      case "C":
        return {
          x: command.coordinates[2], // Second control point of cubic curve
          y: command.coordinates[3],
        };
      case "T":
        // For T commands, we need to calculate what the implicit control point was
        const prevCommand = getCurrentPositionBeforeCommand(
          commands,
          command.id
        );

        const prevControlPoint = getLastControlPoint(commands, i);

        if (prevControlPoint) {
          // The control point for T is the reflection of the previous control point
          return {
            x: 2 * prevCommand.x - prevControlPoint.x,
            y: 2 * prevCommand.y - prevControlPoint.y,
          };
        }
        break;
      case "S":
        // S command also has an implicit control point
        const prevCommandS = getCurrentPositionBeforeCommand(
          commands,
          command.id
        );
        const sPrevControlPoint = getLastControlPoint(commands, i);
        if (sPrevControlPoint) {
          return {
            x: 2 * prevCommandS.x - sPrevControlPoint.x,
            y: 2 * prevCommandS.y - sPrevControlPoint.y,
          };
        }
        break;
    }
  }

  return null;
};

export const convertPathToString = (commands: ParsePath<number>) => {
  return commands
    .map((command) => {
      if (command.letter.toUpperCase() === LINE_COMMANDS.Close) {
        return command.letter;
      }
      return (
        command.letter +
        " " +
        command.coordinates
          .map((coordinate) => formatNumber(coordinate, 2))
          .join(" ")
      );
    })
    .join(" ")
    .toString();
};

export const translate = (
  commands: ParsePath<number>,
  x: string,
  y: string
) => {
  if (commands.length === 0) {
    return [];
  }

  const formatedCommands = commands;

  const xValue = parseFloat(x);
  const yValue = parseFloat(y);

  if (isNaN(xValue) || isNaN(yValue)) {
    return formatedCommands;
  }

  formatedCommands.forEach((command) => {
    const letter = command.letter;

    if (letter === LINE_COMMANDS.Vertical) {
      let parsedCoordinate = command.coordinates[0];
      command.coordinates[0] = parsedCoordinate + yValue;
    }

    if (letter === LINE_COMMANDS.Arc) {
      // 5 === X
      // 6 === Y
      let parsedCoordinateX = command.coordinates[5];
      let parsedCoordinateY = command.coordinates[6];
      command.coordinates[5] = parsedCoordinateX + xValue;
      command.coordinates[6] = parsedCoordinateY + yValue;
    }

    command.coordinates.forEach((coordinate, i) => {
      let newCoordinate = coordinate;

      if (i % 2 === 0) {
        command.coordinates[i] = newCoordinate + xValue;
      } else command.coordinates[i] = newCoordinate + yValue;
    });
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

  const formatedCommands = commands;

  const xValue = parseFloat(rawXFactor);
  const yValue = parseFloat(rawYFactor);

  if (isNaN(xValue) || isNaN(yValue)) {
    return formatedCommands;
  }
  formatedCommands.forEach((command) => {
    const letter = command.letter;

    if (letter === LINE_COMMANDS.Vertical) {
      let parsedCoordinate = command.coordinates[0];
      command.coordinates[0] = parsedCoordinate * yValue;
    }

    if (letter === LINE_COMMANDS.Arc) {
    }

    command.coordinates.forEach((coordinate, i) => {
      let newCoordinate = coordinate;

      if (i % 2 === 0) {
        command.coordinates[i] = newCoordinate * xValue;
      } else command.coordinates[i] = newCoordinate * yValue;
    });
  });

  return formatedCommands;
};

export const isRelativeCommand = (commandLetter: string): boolean => {
  return commandLetter === commandLetter.toLowerCase();
};

const isAbsoluteCommand = (commandLetter: string): boolean => {
  return commandLetter === commandLetter.toUpperCase();
};

// Command pairs mapping
const commandPairs = {
  // Absolute -> Relative
  M: "m",
  L: "l",
  H: "h",
  V: "v",
  C: "c",
  S: "s",
  Q: "q",
  T: "t",
  A: "a",
  Z: "z",
  // Relative -> Absolute
  m: "M",
  l: "L",
  h: "H",
  v: "V",
  c: "C",
  s: "S",
  q: "Q",
  t: "T",
  a: "A",
  z: "Z",
};

// Get the opposite command type
const getOppositeCommand = (commandLetter: string): string => {
  return commandPairs[commandLetter] || commandLetter;
};

// Convert absolute coordinates to relative
export const convertAbsoluteToRelative = (
  command: { letter: string; coordinates: number[] },
  currentPosition: { x: number; y: number }
) => {
  if (isRelativeCommand(command.letter)) {
    return { ...command }; // Already relative
  }

  const newCoordinates = [...command.coordinates];
  const newLetter = getOppositeCommand(command.letter);

  switch (command.letter.toLowerCase()) {
    case "m":
    case "l":
      // Subtract current position from absolute coordinates
      for (let i = 0; i < newCoordinates.length; i += 2) {
        newCoordinates[i] -= currentPosition.x;
        newCoordinates[i + 1] -= currentPosition.y;
      }
      break;

    case "h":
      // Horizontal line - subtract current x
      newCoordinates[0] -= currentPosition.x;
      break;

    case "v":
      // Vertical line - subtract current y
      newCoordinates[0] -= currentPosition.y;
      break;

    case "c":
      // Cubic bezier - subtract current position from all coordinate pairs
      for (let i = 0; i < newCoordinates.length; i += 2) {
        newCoordinates[i] -= currentPosition.x;
        newCoordinates[i + 1] -= currentPosition.y;
      }
      break;

    case "s":
      // Smooth cubic bezier
      newCoordinates[0] -= currentPosition.x; // control point x
      newCoordinates[1] -= currentPosition.y; // control point y
      newCoordinates[2] -= currentPosition.x; // end point x
      newCoordinates[3] -= currentPosition.y; // end point y
      break;

    case "q":
      // Quadratic bezier
      newCoordinates[0] -= currentPosition.x; // control point x
      newCoordinates[1] -= currentPosition.y; // control point y
      newCoordinates[2] -= currentPosition.x; // end point x
      newCoordinates[3] -= currentPosition.y; // end point y
      break;

    case "t":
      // Smooth quadratic bezier
      newCoordinates[0] -= currentPosition.x;
      newCoordinates[1] -= currentPosition.y;
      break;

    case "a":
      // Arc - subtract current position from end point
      newCoordinates[5] -= currentPosition.x;
      newCoordinates[6] -= currentPosition.y;
      break;
  }

  return {
    ...command,
    letter: newLetter,
    coordinates: newCoordinates,
  };
};

export function getCurrentPositionBeforeCommand(
  commands: Command<number>[],
  targetCommandId: string
) {
  let currentPosition = { x: 0, y: 0 };

  for (const command of commands) {
    const { id, letter, coordinates } = command;

    if (letter.toLocaleUpperCase() === LINE_COMMANDS.Close) continue;
    if (id === targetCommandId) {
      break; // Stop before processing the target command
    }

    const handler = commandHandlers[letter.toLocaleUpperCase()];
    const isRelative = isRelativeCommand(letter);
    currentPosition = handler.getAccumulatedPosition(
      currentPosition,
      coordinates,
      isRelative
    );
  }

  return currentPosition;
}

/**
 * Converts absolute coordinates to relative based on current cursor position
 * @param {number} absoluteX - Absolute X coordinate
 * @param {number} absoluteY - Absolute Y coordinate
 * @param {Object} currentPosition - Current cursor position { x, y }
 * @returns {Object} { x, y } relative coordinates
 */
export function absoluteToRelative(absoluteX, absoluteY, currentPosition) {
  return {
    x: absoluteX - currentPosition.x,
    y: absoluteY - currentPosition.y,
  };
}

export function convertRelativeToAbsolute(commands: ParsePath<number>) {
  return commands.map((command) => {
    const { letter, coordinates, id } = command;

    if (letter.toLocaleUpperCase() === LINE_COMMANDS.Close)
      return { ...command, letter: letter.toLocaleUpperCase() };

    const handler = commandHandlers[letter.toLocaleUpperCase()];
    const currentPosition = getCurrentPositionBeforeCommand(commands, id);
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
  });
}

export const updatePoints = (commands: ParsePath<number>) => {
  let currentPosition = { x: 0, y: 0 };
  let points: Point[] = [];

  const absoluteCommands = convertRelativeToAbsolute(commands);
  console.log(absoluteCommands);
  absoluteCommands.forEach((absoluteCommand, index) => {
    if (absoluteCommand.letter.toLocaleUpperCase() === LINE_COMMANDS.Close) {
      return;
    }
    const handler = commandHandlers[absoluteCommand.letter.toLocaleUpperCase()];

    if (absoluteCommand.letter.toUpperCase() === LINE_COMMANDS.Vertical) {
      absoluteCommand.coordinates = [
        Number(currentPosition.x),
        absoluteCommand.coordinates[0],
      ];
    }

    if (absoluteCommand.letter.toUpperCase() === LINE_COMMANDS.Horizontal) {
      absoluteCommand.coordinates = [
        absoluteCommand.coordinates[0],
        Number(currentPosition.y),
      ];
    }

    const generatedPoints = handler.extractPoints(absoluteCommand);
    points.push(...generatedPoints);

    currentPosition = handler.getEndPosition(
      absoluteCommand.coordinates,
      currentPosition
    );
    console.log("Current position:", currentPosition);
  });

  return points;
};
