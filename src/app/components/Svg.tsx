import { usePathObject } from "../context/PathContext";
import { Viewbox } from "../types/Viewbox";
import { updatePoints } from "../utils/pathUtils";
import { Circle } from "./Circle";
import { forwardRef, useEffect } from "react";

type Coordinates = {
  id: string;
  x: number;
  y: number;
};

export default forwardRef(function Svg(
  {
    viewbox,
    svgDimensions,
    setSvgDimensions,
    updateViewbox,
  }: {
    viewbox: Viewbox;
    svgDimensions: any;
    setSvgDimensions: any;
    updateViewbox: (viewbox: Viewbox) => void;
  },
  ref: React.ForwardedRef<SVGSVGElement | null>
) {
  const { pathObject, updateCommands } = usePathObject();
  const circles = updatePoints(pathObject.commands);

  useEffect(() => {
    if (ref?.current) {
      function updateResize() {
        const path = ref?.current.querySelector("path");
        const bbox = path.getBBox();
        const svgWidth = ref?.current.getBoundingClientRect().width || 0;
        const svgHeight = ref?.current.getBoundingClientRect().height || 0;
        let pathWidth = bbox.width + 2;
        let pathHeight = bbox.height + 2;
        const svgAspectRatio = svgHeight / svgWidth;
        const pathAspectRatio = pathHeight / pathWidth;
        if (svgAspectRatio < pathAspectRatio) {
          pathWidth = pathHeight / svgAspectRatio;
        } else {
          pathHeight = svgAspectRatio * pathWidth;
        }

        updateViewbox({
          x: String(bbox.x - 1),
          y: String(bbox.y - 1),
          width: String(pathWidth),
          height: String(pathHeight),
        });

        setSvgDimensions({
          width: ref?.current.getBoundingClientRect().width || 0,
          height: ref?.current.getBoundingClientRect().height || 0,
        });
      }

      updateResize();

      window.addEventListener("resize", updateResize);

      return () => {
        window.removeEventListener("resize", updateResize);
      };
    }
  }, []);

  const handleMove = (values: Coordinates) => {
    const newCommands = pathObject.commands.map((command) => {
      if (command.id !== values.id) return command; // Return unmodified command

      // Create a new coordinates array to ensure immutability
      const newCoordinates = [...command.coordinates];

      switch (command.letter) {
        case "H":
          newCoordinates[0] = values.x;
          break;
        case "V":
          newCoordinates[0] = values.y;
          break;
        case "A":
          newCoordinates[5] = values.x;
          newCoordinates[6] = values.y;
          break;
        case "C":
          newCoordinates[4] = values.x;
          newCoordinates[5] = values.y;
          break;
        case "Q":
          newCoordinates[2] = values.x;
          newCoordinates[3] = values.y;
          break;
        default:
          newCoordinates[0] = values.x;
          newCoordinates[1] = values.y;
      }

      return { ...command, coordinates: newCoordinates }; // Return new object
    });

    updateCommands(newCommands);
  };

  return (
    <svg
      ref={ref}
      className="w-[calc(100%-var(--aside-width))] h-full"
      viewBox={`${viewbox.x.replace(/\.$/, "")} ${viewbox.y.replace(
        /\.$/,
        ""
      )} ${viewbox.width.replace(/\.$/, "")} ${viewbox.height.replace(
        /\.$/,
        ""
      )}`}
    >
      <path
        d={pathObject.path}
        fill="#ffffff40"
        stroke="#fff"
        strokeWidth={parseFloat(viewbox.width) / svgDimensions.width}
      ></path>
      {circles.map((circle) => (
        <Circle
          key={circle.id}
          id={circle.id}
          radius={String(3 * (parseFloat(viewbox.width) / svgDimensions.width))}
          cx={circle.cx}
          cy={circle.cy}
          fill={circle.fill}
          handleMove={handleMove}
        ></Circle>
      ))}
    </svg>
  );
});
