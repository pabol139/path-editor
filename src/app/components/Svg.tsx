import { usePath } from "../context/PathContext";
import { Viewbox } from "../types/Viewbox";
import { RefObject, useRef } from "react";
import { parsePath, updatePoints } from "../utils/pathUtils";
import { Circle } from "./Circle";

export default function Svg({ viewbox }: { viewbox: Viewbox }) {
  const path = usePath();
  const commands = parsePath(path);
  const circles = updatePoints(commands);
  console.log(circles);

  return (
    <svg
      className="w-[calc(100%-var(--aside-width))] h-full"
      viewBox={`${viewbox.x} ${viewbox.y} ${viewbox.width} ${viewbox.height}`}
    >
      <path d={path} fill="#ffffff40" stroke="#fff" strokeWidth={1}></path>
      {circles.map((circle) => (
        <Circle
          radius={circle.radius}
          cx={circle.cx}
          cy={circle.cy}
          fill={circle.fill}
        ></Circle>
      ))}
    </svg>
  );
}
