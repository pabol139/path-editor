"use client";
import { useState } from "react";
import Sidebar from "./Sidebar";
import { Viewbox } from "../types/Viewbox";

export default function MainSvg() {
  const [viewbox, setViewbox] = useState<Viewbox>({
    x: -230,
    y: -140,
    width: 1200,
    height: 1000,
  });

  const [path, setPath] = useState<string>(
    "M 200 500 H 500 L 500 220 L 200 220 Z"
  );

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

  const parsePath = () => {
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

  const translate = (x: string, y: string) => {
    const commands = parsePath() || [];

    if (commands.length === 0) throw new Error("No commands available");

    const xValue = parseFloat(x);
    const yValue = parseFloat(y);

    if (isNaN(xValue) || isNaN(yValue))
      throw new Error("Invalid translate parameters");

    commands.forEach((command) => {
      const letter = command.letter;

      if (letter === "V") {
        var parsedCoordinate = parseFloat(command.coordinates[0]);
        command.coordinates[0] = (parsedCoordinate + yValue).toString();
      }

      if (letter === "A") {
        // 5 === X
        // 6 === Y
        var parsedCoordinateX = parseFloat(command.coordinates[5]);
        var parsedCoordinateY = parseFloat(command.coordinates[6]);
        command.coordinates[5] = (parsedCoordinateX + xValue).toString();
        command.coordinates[6] = (parsedCoordinateY + yValue).toString();
      }

      command.coordinates.forEach((coordinate, i) => {
        var newCoordinate = parseFloat(coordinate);

        if (i % 2 === 0) {
          command.coordinates[i] = (newCoordinate + xValue).toString();
        } else command.coordinates[i] = (newCoordinate + yValue).toString();
      });
    });
  };

  const rotate = (originX: string, originY: string, angle: string) => {};

  translate("1", "2");

  // Type for updateViewbox function
  const updateViewbox = (key: keyof Viewbox, value: number) => {
    setViewbox((prevState) => ({
      ...prevState,
      [key]: value,
    }));
  };

  return (
    <>
      <svg
        className="w-full h-full"
        viewBox={`${viewbox.x} ${viewbox.y} ${viewbox.width} ${viewbox.height}`}
      >
        <path d={path} fill="#ffffff40" stroke="#fff" strokeWidth={1}></path>
      </svg>
      <Sidebar
        viewbox={viewbox}
        path={path}
        setPath={setPath}
        setViewbox={updateViewbox}
      />
    </>
  );
}
