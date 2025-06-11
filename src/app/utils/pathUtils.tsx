import { ParsePath } from "@/types/Path";
import { CircleType } from "@/types/Circle";
import { comma } from "postcss/lib/list";

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
  const commands = [];
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
    let regexTable = kGrammar[commandLetter] || [];
    let j = 0;
    let coordinates = [];
    while (j < regexTable.length) {
      let regex = regexTable[j];
      let newMatch = path.slice(i).match(regex);

      if (!newMatch)
        throw new Error("malformed path (first error at " + i + ")");

      coordinates.push(parseFloat(newMatch[0]));
      i = i + newMatch[0].length;

      while (path.slice(i).match(kCommaWsp)) {
        i++;
      }

      j++;
    }

    commands.push({
      id: crypto.randomUUID(),
      letter: commandLetter.toUpperCase(),
      coordinates: coordinates,
    });
  }

  updatePoints(commands);
  return commands;
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

export const updatePoints = (commands: ParsePath<number>) => {
  let lastPositionX = "0";
  let lastPositionY = "0";
  let points: CircleType[] = [];

  const generateCircleId = (
    commandId: string,
    coordIndex: number,
    type?: string
  ) => {
    return `circle_${commandId}_${coordIndex}${type ? `_${type}` : ""}`;
  };

  commands.forEach((command) => {
    if (command.letter === lineCommands.Close) {
      return;
    }

    const circle = {
      id: generateCircleId(command.id, 0),
      id_command: command.id,
      coordinate_index: 0,
      radius: "10",
      cy: "0",
      cx: "0",
      control: false,
    };

    if (command.letter === lineCommands.Vertical) {
      circle.cx = lastPositionX;
      circle.cy = command.coordinates[0].toString();
      lastPositionY = command.coordinates[0].toString();
      points.push(circle);
      return;
    }

    if (command.letter === lineCommands.Horizontal) {
      circle.id = generateCircleId(command.id, 0);
      circle.cx = command.coordinates[0].toString();
      circle.cy = lastPositionY;
      lastPositionX = command.coordinates[0].toString();
      points.push(circle);

      return;
    }

    if (command.letter === lineCommands.Arc) {
      circle.id = generateCircleId(command.id, 5);
      circle.coordinate_index = 5;
      circle.cx = command.coordinates[5].toString();
      circle.cy = command.coordinates[6].toString();
      lastPositionX = command.coordinates[5].toString();
      lastPositionY = command.coordinates[6].toString();
      points.push(circle);

      return;
    }

    if (command.letter === lineCommands.Curve) {
      const controlPointStart = {
        ...circle,
        id: generateCircleId(command.id, 0),
        coordinate_index: 0,
        control: true,
      };
      const controlPointEnd = {
        ...circle,
        id: generateCircleId(command.id, 2),
        coordinate_index: 2,
        control: true,
      };
      const coordinates = {
        ...circle,
        id: generateCircleId(command.id, 4),
        coordinate_index: 4,
      };

      controlPointStart.cx = command.coordinates[0].toString();
      controlPointStart.cy = command.coordinates[1].toString();
      controlPointEnd.cx = command.coordinates[2].toString();
      controlPointEnd.cy = command.coordinates[3].toString();
      coordinates.cx = command.coordinates[4].toString();
      coordinates.cy = command.coordinates[5].toString();

      lastPositionX = command.coordinates[4].toString();
      lastPositionY = command.coordinates[5].toString();

      points.push(controlPointStart);
      points.push(controlPointEnd);
      points.push(coordinates);

      return;
    }

    if (command.letter === lineCommands.QuadraticCurve) {
      const controlPointStart = {
        ...circle,
        id: generateCircleId(command.id, 0),
        coordinate_index: 0,
        control: true,
      };
      const controlPointEnd = {
        ...circle,
        id: generateCircleId(command.id, 2),
        coordinate_index: 2,
      };

      controlPointStart.cx = command.coordinates[0].toString();
      controlPointStart.cy = command.coordinates[1].toString();
      controlPointEnd.cx = command.coordinates[2].toString();
      controlPointEnd.cy = command.coordinates[3].toString();

      points.push(controlPointStart);
      points.push(controlPointEnd);

      return;
    }

    command.coordinates.forEach((coordinate, index) => {
      if (index % 2 === 0) {
        circle.cx = coordinate.toString();
        lastPositionX = coordinate.toString();
      } else {
        circle.cy = coordinate.toString();
        lastPositionY = coordinate.toString();
      }
    });
    points.push(circle);
  });
  return points;
};
