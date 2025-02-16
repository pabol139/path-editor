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
  Z: [],
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
};

type Command<T> = {
  letter: string;
  coordinates: T[];
};

type ParsePath<T> = Command<T>[];

export const parsePath = (path: string): ParsePath<string> => {
  const commands = [];
  var i = 0;

  while (i < path.length) {
    const match = path.slice(i).match(kCommandTypeRegex);

    if (match === null)
      throw new Error("malformed path (first error at " + i + ")");

    const commandLetterWithSpaces = match[0];
    const commandLetter = match[1];

    if (i === 0 && commandLetter.toUpperCase() !== "M") {
      throw new Error("malformed path (first error at " + i + ")");
    }
    i = i + commandLetterWithSpaces.length;
    var regexTable = kGrammar[commandLetter];
    var j = 0;
    var coordinates = [];
    while (j < regexTable.length) {
      var regex = regexTable[j];
      var newMatch = path.slice(i).match(regex);

      if (!newMatch)
        throw new Error("malformed path (first error at " + i + ")");

      coordinates.push(newMatch[1]);
      i = i + newMatch[0].length;

      while (path.slice(i).match(kCommaWsp)) {
        i++;
      }

      j++;
    }

    commands.push({
      letter: commandLetter.toUpperCase(),
      coordinates: coordinates,
    });
  }
  return commands;
};

const convertCoordinatesToFloat = (commands: ParsePath<string>) => {
  return commands.map((command) => ({
    ...command,
    coordinates: command.coordinates.map((coordinate: string) =>
      parseFloat(coordinate)
    ),
  }));
};

export const translate = (path: string, x: string, y: string) => {
  const commands: ParsePath<string> = parsePath(path) || [];

  if (commands.length === 0) throw new Error("No commands available");

  const formatedCommands: ParsePath<number> =
    convertCoordinatesToFloat(commands);

  const xValue = parseFloat(x);
  const yValue = parseFloat(y);

  if (isNaN(xValue) || isNaN(yValue))
    throw new Error("Invalid translate parameters");

  formatedCommands.forEach((command) => {
    const letter = command.letter;

    if (letter === "V") {
      var parsedCoordinate = command.coordinates[0];
      command.coordinates[0] = parsedCoordinate + yValue;
    }

    if (letter === "A") {
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

  return convertPathToString(formatedCommands);
};

const convertPathToString = (commands: ParsePath<number>) => {
  return commands
    .map((command) => {
      if (command.letter.toUpperCase() === "Z") {
        return command.letter;
      }

      return (
        command.letter +
        " " +
        command.coordinates.map((coordinate) => coordinate.toString() + " ")
      );
    })
    .toString()
    .replace(/,/g, "");
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
