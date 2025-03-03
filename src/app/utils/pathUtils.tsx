import { PathObject, ParsePath } from "../types/Path";

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
  var i = 0;

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
    var regexTable = kGrammar[commandLetter] || [];
    var j = 0;
    var coordinates = [];
    while (j < regexTable.length) {
      var regex = regexTable[j];
      var newMatch = path.slice(i).match(regex);

      if (!newMatch)
        throw new Error("malformed path (first error at " + i + ")");

      coordinates.push(parseFloat(newMatch[1]));
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

export const mergeCommands = (
  oldCommands: ParsePath<number>,
  newCommands: ParsePath<number>
): ParsePath<number> => {
  const filteredArray = oldCommands.map((oldCommand) => {
    const matchedCommand = newCommands.find(
      (command) => command.id === oldCommand.id
    );
    return matchedCommand;
  });

  return filteredArray;
};

const convertCoordinatesToFloat = (commands: ParsePath<string>) => {
  return commands.map((command) => ({
    ...command,
    coordinates: command.coordinates.map((coordinate: string) =>
      parseFloat(coordinate)
    ),
  }));
};

const formatNumber = (number: number, decimals: number): string => {
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
  if (commands.length === 0) throw new Error("No commands available");

  const formatedCommands = commands;

  const xValue = parseFloat(x);
  const yValue = parseFloat(y);

  if (isNaN(xValue) || isNaN(yValue))
    throw new Error("Invalid translate parameters");

  formatedCommands.forEach((command) => {
    const letter = command.letter;

    if (letter === lineCommands.Vertical) {
      var parsedCoordinate = command.coordinates[0];
      command.coordinates[0] = parsedCoordinate + yValue;
    }

    if (letter === lineCommands.Arc) {
      // 5 === X
      // 6 === Y
      var parsedCoordinateX = command.coordinates[5];
      var parsedCoordinateY = command.coordinates[6];
      command.coordinates[5] = parsedCoordinateX + xValue;
      command.coordinates[6] = parsedCoordinateY + yValue;
    }

    command.coordinates.forEach((coordinate, i) => {
      var newCoordinate = coordinate;

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
  if (commands.length === 0) throw new Error("No commands available");

  const formatedCommands = commands;

  const xValue = parseFloat(rawXFactor);
  const yValue = parseFloat(rawYFactor);

  if (isNaN(xValue) || isNaN(yValue))
    throw new Error("Invalid translate parameters");

  formatedCommands.forEach((command) => {
    const letter = command.letter;

    if (letter === lineCommands.Vertical) {
      var parsedCoordinate = command.coordinates[0];
      command.coordinates[0] = parsedCoordinate * yValue;
    }

    if (letter === lineCommands.Arc) {
    }

    command.coordinates.forEach((coordinate, i) => {
      var newCoordinate = coordinate;

      if (i % 2 === 0) {
        command.coordinates[i] = newCoordinate * xValue;
      } else command.coordinates[i] = newCoordinate * yValue;
    });
  });

  return formatedCommands;
};

export const updatePoints = (commands: ParsePath<number>) => {
  var lastPositionX = "0";
  var lastPositionY = "0";
  var points = [];

  commands.forEach((command) => {
    if (command.letter === lineCommands.Close) {
      return;
    }

    const circle = {
      id: command.id,
      radius: "10",
      fill: "red",
      cy: "0",
      cx: "0",
    };

    if (command.letter === lineCommands.Vertical) {
      circle.cx = lastPositionX;
      circle.cy = command.coordinates[0].toString();
      lastPositionY = command.coordinates[0].toString();
      points.push(circle);
      return;
    }

    if (command.letter === lineCommands.Horizontal) {
      circle.cx = command.coordinates[0].toString();
      circle.cy = lastPositionY;
      lastPositionX = command.coordinates[0].toString();
      points.push(circle);

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

// const rotate = (originX: string, originY: string, angle: number) => {
//   const commands = parsePath() || [];
//   const parsedOriginX = parseFloat(originX);
//   const parsedOriginY = parseFloat(originY);

//   var radians = (Math.PI / 180) * angle,
//     cos = Math.cos(radians),
//     sin = Math.sin(radians);

//   //   nx = cos * (x - originX) + sin * (y - originY) + originX,
//   //   ny = cos * (y - originY) - sin * (x - originX) + originY;
//   commands.forEach((command) => {
//     const letter = command.letter;

//     if (letter === "V") {
//       var parsedCoordinate = parseFloat(command.coordinates[0]);
//       command.coordinates[0] = (
//         cos * (parsedCoordinate - parsedOriginY) -
//         sin * (0 - parsedOriginX) +
//         parsedOriginY
//       ;
//     }

//     if (letter === "A") {
//       // 2 === X-axis-rotation
//       // 5 === X
//       // 6 === Y
//       command.coordinates[2] = (
//         (parseFloat(command.coordinates[2]) + angle) %
//         360
//       ).toString();

//       var parsedCoordinateX = parseFloat(command.coordinates[5]);
//       var parsedCoordinateY = parseFloat(command.coordinates[6]);
//       command.coordinates[5] = (
//         cos * (parsedCoordinateX - parsedOriginX) +
//         sin * (parsedCoordinateY - parsedOriginY) +
//         parsedOriginX
//       ).toString();
//       command.coordinates[6] = (
//         cos * (parsedCoordinateY - parsedOriginY) -
//         sin * (parsedCoordinateX - parsedOriginX) +
//         parsedOriginY
//       ).toString();
//     }

//     for (let i = 0; i < command.coordinates.length; i += 2) {
//       const xCoordinate = parseFloat(command.coordinates[i]);
//       const yCoordinate = parseFloat(command.coordinates[i + 1]);

//       if (isNaN(xCoordinate) || isNaN(yCoordinate))
//         throw new Error("Invalid coordinates in rotation");

//       command.coordinates[i] = (
//         cos * (xCoordinate - parsedOriginX) +
//         sin * (yCoordinate - parsedOriginY) +
//         parsedOriginX
//       ).toString();
//       command.coordinates[i + 1] = (
//         cos * (yCoordinate - parsedOriginY) -
//         sin * (xCoordinate - parsedOriginX) +
//         parsedOriginY
//       ).toString();
//     }
//   });
// };
