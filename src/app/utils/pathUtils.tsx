import { Command, ParsePath } from "@/types/Path";
import { CircleType } from "@/types/Circle";
import { Point } from "@/types/Point";

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

interface CommandHandler {
  extractPoints?: (command: Command<number>) => Point[];
  updateCoordinates: (
    coords: number[],
    x: number,
    y: number,
    pointIndex: number,
    currentPosition: { x: number; y: number }
  ) => number[];
  toAbsolute: (
    coords: number[],
    currentPosition: { x: number; y: number }
  ) => [string, number[]];
  toRelative: (
    coords: number[],
    currentPosition: { x: number; y: number }
  ) => number[];
  getAccumulatedPosition: (
    currentPosition: { x: number; y: number },
    coords: number[]
  ) => { x: number; y: number };
  validate?: (coords: number[]) => boolean;
  getEndPosition?: (
    coordinates: number[],
    currentPosition: { x: number; y: number }
  ) => { x: number; y: number };
}

const generateBasePoint = (
  command: Command<number>,
  coordIndex: number,
  type?: string
) => {
  const { id, hovered, selected } = command;

  return {
    id: `circle_${id}_${coordIndex}${type ? `_${type}` : ""}`,
    id_command: id,
    coordinate_index: coordIndex,
    radius: "10",
    cx: "0",
    cy: "0",
    control: false,
    hovered: hovered,
    selected: selected,
  };
};

export const commandHandlers: Record<string, CommandHandler> = {
  M: {
    extractPoints: (command) => [
      {
        ...generateBasePoint(command, 0),
        cx: String(command.coordinates[0]),
        cy: String(command.coordinates[1]),
      },
    ],
    updateCoordinates: (coords, x, y, pointIndex) => [x, y],
    toAbsolute: (coords, currentPosition) => ["M", coords], // Already absolute
    toRelative: (absoluteCoords, currentPosition) => [
      absoluteCoords[0] - currentPosition.x,
      absoluteCoords[1] - currentPosition.y,
    ],
    getAccumulatedPosition: (currentPosition, coords) => ({
      x: coords[0],
      y: coords[1],
    }),
    getEndPosition: (coords) => ({ x: coords[0], y: coords[1] }),
  },
  m: {
    updateCoordinates: (coords, x, y, pointIndex, currentPosition) => {
      // Convert new absolute position back to relative coordinates
      return [x - currentPosition.x, y - currentPosition.y];
    },
    toAbsolute: (coords, currentPosition) => [
      "M",
      [currentPosition.x + coords[0], currentPosition.y + coords[1]],
    ],
    toRelative: (absoluteCoords, currentPosition) => absoluteCoords, // Already relative
    getAccumulatedPosition: (currentPosition, coords) => ({
      x: coords[0] + currentPosition.x,
      y: coords[1] + currentPosition.y,
    }),
  },
  L: {
    extractPoints: (command) => [
      {
        ...generateBasePoint(command, 0),
        cx: String(command.coordinates[0]),
        cy: String(command.coordinates[1]),
      },
    ],
    updateCoordinates: (coords, x, y, pointIndex) => [x, y],
    toAbsolute: (coords, currentPosition) => ["L", coords], // Already absolute
    toRelative: (absoluteCoords, currentPosition) => [
      absoluteCoords[0] - currentPosition.x,
      absoluteCoords[1] - currentPosition.y,
    ],
    getAccumulatedPosition: (currentPosition, coords) => ({
      x: coords[0],
      y: coords[1],
    }),
    getEndPosition: (coords) => ({ x: coords[0], y: coords[1] }),
  },
  l: {
    updateCoordinates: (coords, x, y, pointIndex, currentPosition) => {
      // Convert new absolute position back to relative coordinates
      return [x - currentPosition.x, y - currentPosition.y];
    },
    toAbsolute: (coords, currentPosition) => [
      "L",
      [currentPosition.x + coords[0], currentPosition.y + coords[1]],
    ], // Already absolute
    toRelative: (coords, currentPosition) => coords,
    getAccumulatedPosition: (currentPosition, coords) => ({
      x: coords[0] + currentPosition.x,
      y: coords[1] + currentPosition.y,
    }),
  },
  H: {
    extractPoints: (command) => [
      {
        ...generateBasePoint(command, 0),
        cx: String(command.coordinates[0]),
        cy: String(command.coordinates[1]),
      },
    ],
    updateCoordinates: (coords, x, y, pointIndex) => [x],
    toAbsolute: (coords, currentPosition) => ["H", coords], // Already absolute
    toRelative: (absoluteCoords, currentPosition) => [
      absoluteCoords[0] - currentPosition.x,
    ],
    getAccumulatedPosition: (currentPosition, coords) => ({
      x: coords[0],
      y: currentPosition.y,
    }),
    getEndPosition: (coords, currentPosition) => ({
      x: coords[0],
      y: currentPosition.y,
    }),
  },
  h: {
    updateCoordinates: (coords, x, y, pointIndex, currentPosition) => {
      // Convert new absolute position back to relative coordinates
      return [x - currentPosition.x];
    },
    toAbsolute: (coords, currentPosition) => [
      "H",
      [currentPosition.x + coords[0]],
    ], // Already absolute
    toRelative: (coords, currentPosition) => coords,
    getAccumulatedPosition: (currentPosition, coords) => ({
      x: coords[0] + currentPosition.x,
      y: currentPosition.y,
    }),
  },

  V: {
    extractPoints: (command) => [
      {
        ...generateBasePoint(command, 0),
        cx: String(command.coordinates[0]),
        cy: String(command.coordinates[1]),
      },
    ],
    updateCoordinates: (coords, x, y, pointIndex) => [y],
    toAbsolute: (coords, currentPosition) => ["V", coords], // Already absolute
    toRelative: (absoluteCoords, currentPosition) => [
      absoluteCoords[0] - currentPosition.y,
    ],
    getAccumulatedPosition: (currentPosition, coords) => ({
      x: currentPosition.x,
      y: coords[0],
    }),
    getEndPosition: (coords, currentPosition) => ({
      x: currentPosition.x,
      y: coords[0],
    }),
  },
  v: {
    updateCoordinates: (coords, x, y, pointIndex, currentPosition) => {
      // Convert new absolute position back to relative coordinates
      return [y - currentPosition.y];
    },
    toAbsolute: (coords, currentPosition) => [
      "V",
      [currentPosition.y + coords[0]],
    ], // Already absolute
    toRelative: (coords, currentPosition) => coords,
    getAccumulatedPosition: (currentPosition, coords) => ({
      x: currentPosition.x,
      y: coords[0] + currentPosition.y,
    }),
  },
  Q: {
    extractPoints: (command) => [
      {
        ...generateBasePoint(command, 0),
        cx: String(command.coordinates[0]),
        cy: String(command.coordinates[1]),
        control: true,
      },
      {
        ...generateBasePoint(command, 2),
        cx: String(command.coordinates[2]),
        cy: String(command.coordinates[3]),
      },
    ],
    updateCoordinates: (coords, x, y, pointIndex) => {
      const newCoords = [...coords];
      newCoords[pointIndex] = x;
      newCoords[pointIndex + 1] = y;
      return newCoords;
    },
    toAbsolute: (coords, currentPosition) => ["Q", coords], // Already absolute
    toRelative: (absoluteCoords, currentPosition) => [
      absoluteCoords[0] - currentPosition.x,
      absoluteCoords[1] - currentPosition.y,
      absoluteCoords[2] - currentPosition.x,
      absoluteCoords[3] - currentPosition.y,
    ],
    getAccumulatedPosition: (currentPosition, coords) => ({
      x: coords[2],
      y: coords[3],
    }),
    getEndPosition: (coords) => ({ x: coords[2], y: coords[3] }),
  },

  q: {
    updateCoordinates: (coords, x, y, pointIndex, currentPosition) => {
      const newCoords = [...coords];
      newCoords[pointIndex] = x - currentPosition.x;
      newCoords[pointIndex + 1] = y - currentPosition.y;
      return newCoords;
    },
    toAbsolute: (coords, currentPosition) => [
      "Q",
      [
        coords[0] + currentPosition.x,
        coords[1] + currentPosition.y,
        coords[2] + currentPosition.x,
        coords[3] + currentPosition.y,
      ],
    ], // Already absolute
    toRelative: (coords, currentPosition) => coords,
    getAccumulatedPosition: (currentPosition, coords) => ({
      x: coords[2] + currentPosition.x,
      y: coords[3] + currentPosition.y,
    }),
  },
  T: {
    extractPoints: (command) => [
      {
        ...generateBasePoint(command, 0),
        cx: String(command.coordinates[0]),
        cy: String(command.coordinates[1]),
      },
    ],
    updateCoordinates: (coords, x, y, pointIndex) => [x, y],
    toAbsolute: (coords, currentPosition) => ["T", coords], // Already absolute
    toRelative: (absoluteCoords, currentPosition) => [
      absoluteCoords[0] - currentPosition.x,
      absoluteCoords[1] - currentPosition.y,
    ],
    getAccumulatedPosition: (currentPosition, coords) => ({
      x: coords[0],
      y: coords[1],
    }),
    getEndPosition: (coords) => ({ x: coords[0], y: coords[1] }),
  },
  t: {
    updateCoordinates: (coords, x, y, pointIndex, currentPosition) => {
      // Convert new absolute position back to relative coordinates
      return [x - currentPosition.x, y - currentPosition.y];
    },
    toAbsolute: (coords, currentPosition) => [
      "T",
      [currentPosition.x + coords[0], currentPosition.y + coords[1]],
    ], // Already absolute
    toRelative: (coords, currentPosition) => coords,
    getAccumulatedPosition: (currentPosition, coords) => ({
      x: coords[0] + currentPosition.x,
      y: coords[1] + currentPosition.y,
    }),
  },
  C: {
    extractPoints: (command) => [
      {
        ...generateBasePoint(command, 0),
        cx: String(command.coordinates[0]),
        cy: String(command.coordinates[1]),
        control: true,
      },
      {
        ...generateBasePoint(command, 2),
        cx: String(command.coordinates[2]),
        cy: String(command.coordinates[3]),
        control: true,
      },
      {
        ...generateBasePoint(command, 4),
        cx: String(command.coordinates[4]),
        cy: String(command.coordinates[5]),
      },
    ],
    updateCoordinates: (coords, x, y, pointIndex) => {
      const newCoords = [...coords];
      newCoords[pointIndex] = x;
      newCoords[pointIndex + 1] = y;
      return newCoords;
    },
    toAbsolute: (coords, currentPosition) => ["C", coords], // Already absolute
    toRelative: (absoluteCoords, currentPosition) =>
      absoluteCoords.map((absoluteCoord, index) =>
        index % 2 === 0
          ? absoluteCoord - currentPosition.x
          : absoluteCoord - currentPosition.y
      ),
    getAccumulatedPosition: (currentPosition, coords) => ({
      x: coords[4],
      y: coords[5],
    }),
    getEndPosition: (coords) => ({ x: coords[4], y: coords[5] }),
  },
  c: {
    updateCoordinates: (coords, x, y, pointIndex, currentPosition) => {
      // Convert new absolute position back to relative coordinates
      const newCoords = [...coords];
      newCoords[pointIndex] = x - currentPosition.x;
      newCoords[pointIndex + 1] = y - currentPosition.y;
      return newCoords;
    },
    toAbsolute: (coords, currentPosition) => [
      "C",
      coords.map((coord, index) =>
        index % 2 === 0 ? coord + currentPosition.x : coord + currentPosition.y
      ),
    ], // Already absolute
    toRelative: (coords, currentPosition) => coords,
    getAccumulatedPosition: (currentPosition, coords) => ({
      x: coords[4] + currentPosition.x,
      y: coords[5] + currentPosition.y,
    }),
  },
  S: {
    extractPoints: (command) => [
      {
        ...generateBasePoint(command, 0),
        cx: String(command.coordinates[0]),
        cy: String(command.coordinates[1]),
        control: true,
      },
      {
        ...generateBasePoint(command, 2),
        cx: String(command.coordinates[2]),
        cy: String(command.coordinates[3]),
        control: true,
      },
    ],
    updateCoordinates: (coords, x, y, pointIndex) => {
      const newCoords = [...coords];
      newCoords[pointIndex] = x;
      newCoords[pointIndex + 1] = y;
      return newCoords;
    },
    toAbsolute: (coords, currentPosition) => ["S", coords], // Already absolute
    toRelative: (absoluteCoords, currentPosition) => [
      absoluteCoords[0] - currentPosition.x,
      absoluteCoords[1] - currentPosition.y,
      absoluteCoords[2] - currentPosition.x,
      absoluteCoords[3] - currentPosition.y,
    ],
    getAccumulatedPosition: (currentPosition, coords) => ({
      x: coords[2],
      y: coords[3],
    }),
    getEndPosition: (coords) => ({ x: coords[2], y: coords[3] }),
  },
  s: {
    updateCoordinates: (coords, x, y, pointIndex, currentPosition) => {
      // Convert new absolute position back to relative coordinates
      const newCoords = [...coords];
      newCoords[pointIndex] = x - currentPosition.x;
      newCoords[pointIndex + 1] = y - currentPosition.y;
      return newCoords;
    },
    toAbsolute: (coords, currentPosition) => [
      "S",
      [
        coords[0] + currentPosition.x,
        coords[1] + currentPosition.y,
        coords[2] + currentPosition.x,
        coords[3] + currentPosition.y,
      ],
    ],
    toRelative: (coords, currentPosition) => coords,
    getAccumulatedPosition: (currentPosition, coords) => ({
      x: coords[2] + currentPosition.x,
      y: coords[3] + currentPosition.y,
    }),
  },
  A: {
    extractPoints: (command) => [
      {
        ...generateBasePoint(command, 5),
        cx: String(command.coordinates[5]),
        cy: String(command.coordinates[6]),
      },
    ],
    updateCoordinates: (coords, x, y, pointIndex) => {
      const newCoords = [...coords];
      newCoords[pointIndex] = x;
      newCoords[pointIndex + 1] = y;
      return newCoords;
    },
    toAbsolute: (coords, currentPosition) => ["A", coords], // Already absolute
    toRelative: (absoluteCoords, currentPosition) => [
      absoluteCoords[5] - currentPosition.x,
      absoluteCoords[6] - currentPosition.y,
    ],
    getAccumulatedPosition: (currentPosition, coords) => ({
      x: coords[5],
      y: coords[6],
    }),
    getEndPosition: (coords) => ({ x: coords[5], y: coords[6] }),
  },
  a: {
    updateCoordinates: (coords, x, y, pointIndex, currentPosition) => {
      // Convert new absolute position back to relative coordinates
      const newCoords = [...coords];
      newCoords[pointIndex] = x - currentPosition.x;
      newCoords[pointIndex + 1] = y - currentPosition.y;
      return newCoords;
    },
    toAbsolute: (coords, currentPosition) => [
      "A",
      [coords[5] + currentPosition.x, coords[6] + currentPosition.y],
    ],
    toRelative: (coords, currentPosition) => coords,
    getAccumulatedPosition: (currentPosition, coords) => ({
      x: coords[5] + currentPosition.x,
      y: coords[6] + currentPosition.y,
    }),
  },
};

const lineCommands = {
  MoveTo: "M",
  LineTo: "L",
  Horizontal: "H",
  Vertical: "V",
  Curve: "C",
  SmoothCurve: "S",
  QuadraticCurve: "Q",
  SmoothQuadraticCurve: "T",
  Arc: "A",
  Close: "Z",
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

    if (i === 0 && commandLetter.toUpperCase() !== lineCommands.MoveTo) {
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
      if (command.letter.toUpperCase() === lineCommands.Close) {
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

    if (letter === lineCommands.Vertical) {
      let parsedCoordinate = command.coordinates[0];
      command.coordinates[0] = parsedCoordinate + yValue;
    }

    if (letter === lineCommands.Arc) {
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

    if (letter === lineCommands.Vertical) {
      let parsedCoordinate = command.coordinates[0];
      command.coordinates[0] = parsedCoordinate * yValue;
    }

    if (letter === lineCommands.Arc) {
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

export function getCurrentPositionBeforeCommand(commands, targetCommandId) {
  let currentPosition = { x: 0, y: 0 };

  for (const command of commands) {
    if (command.id === targetCommandId) {
      break; // Stop before processing the target command
    }
    const { letter, coordinates } = command;

    const handler = commandHandlers[letter];
    currentPosition = handler.getAccumulatedPosition(
      currentPosition,
      coordinates
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

    if (letter.toLocaleUpperCase() === lineCommands.Close)
      return { ...command };

    const handler = commandHandlers[letter];
    const currentPosition = getCurrentPositionBeforeCommand(commands, id);

    const [updatedLetter, updatedCoordinates] = handler.toAbsolute(
      coordinates,
      currentPosition
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

  absoluteCommands.forEach((absoluteCommand, index) => {
    if (absoluteCommand.letter.toLocaleUpperCase() === lineCommands.Close) {
      return;
    }
    const handler = commandHandlers[absoluteCommand.letter];

    if (absoluteCommand.letter.toUpperCase() === lineCommands.Vertical)
      absoluteCommand.coordinates = [
        Number(currentPosition.x),
        absoluteCommand.coordinates[0],
      ];

    if (absoluteCommand.letter.toUpperCase() === lineCommands.Horizontal)
      absoluteCommand.coordinates = [
        absoluteCommand.coordinates[0],
        Number(currentPosition.y),
      ];

    const generatedPoints = handler.extractPoints(absoluteCommand);
    points.push(...generatedPoints);

    currentPosition = handler.getEndPosition(
      absoluteCommand.coordinates,
      currentPosition
    );
  });

  return points;
};
