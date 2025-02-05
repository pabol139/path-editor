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

  const pathCommands = {
    M: { xAxis: true, yAxis: true },
    L: { xAxis: true, yAxis: true },
    H: { xAxis: true, yAxis: false },
    V: { xAxis: false, yAxis: true },
    C: { xAxis: true, yAxis: true },
    S: { xAxis: true, yAxis: true },
    Q: { xAxis: true, yAxis: true },
    T: { xAxis: true, yAxis: true },
    A: { xAxis: true, yAxis: true },
    Z: { xAxis: false, yAxis: false },
  };

  const handleYAxis = () => {
    const commands = [];
    var lastCommand = "";
    var coordinates = "";
    var i = 0;

    while (i < path.length) {
      var char = path[i].toUpperCase();

      if (pathCommands[char]) {
        if (lastCommand) {
          commands.push({
            command: lastCommand,
            coordinates: coordinates,
          });

          if (char === "Z") {
            commands.push({
              command: char,
            });
          }
          coordinates = "";
          lastCommand = "";
        }
        lastCommand = char;
      } else {
        coordinates += char;
      }
      i++;
    }

    console.log(commands);
  };
  handleYAxis();

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
