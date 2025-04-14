import { usePathObject } from "../context/PathContext";
import { Viewbox } from "../types/Viewbox";
import { updatePoints } from "../utils/pathUtils";
import { Circle } from "./Circle";
import { forwardRef, useEffect, useState } from "react";

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
  const [dragging, setDragging] = useState(false);
  const [lastPosition, setLastPosition] = useState(null);
  const circles = updatePoints(pathObject.commands);
  const svgRef = ref as React.RefObject<SVGSVGElement>;

  useEffect(() => {
    if (svgRef?.current) {
      function updateResize() {
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

        updateViewbox({
          x: String(pathX),
          y: String(pathY),
          width: String(pathWidth + percentFactorWidth),
          height: String(pathHeight + percentFactorHeight),
        });

        setSvgDimensions({
          width: svgRef.current.getBoundingClientRect().width || 0,
          height: svgRef.current.getBoundingClientRect().height || 0,
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

  const handlePointerDown = (event: React.PointerEvent<SVGSVGElement>) => {
    setDragging(true);
    const svg = svgRef.current;

    const point = svg.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    const svgPoint = point.matrixTransform(svg.getScreenCTM()?.inverse());
    setLastPosition({
      x: svgPoint.x,
      y: svgPoint.y,
    });
    (event.target as HTMLElement).setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<SVGSVGElement>) => {
    if (!dragging) {
      return;
    }
    const svg = svgRef.current;

    const point = svg.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    const svgPoint = point.matrixTransform(svg.getScreenCTM()?.inverse());

    const deltaX = -(svgPoint.x - lastPosition.x);
    const deltaY = -(svgPoint.y - lastPosition.y);
    console.log("Viewbox X:" + svgPoint.x);

    updateViewbox({
      width: viewbox.width,
      height: viewbox.height,
      x: String(parseFloat(viewbox.x) + deltaX),
      y: String(parseFloat(viewbox.y) + deltaY),
    });
  };

  return (
    <svg
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerLeave={() => {
        setDragging(false);
        setLastPosition(null);
      }}
      onPointerUp={(event) => {
        setDragging(false);
        setLastPosition(null);
        (event.target as HTMLElement).releasePointerCapture(event.pointerId);
      }}
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
        strokeWidth={String(
          (1.5 * parseFloat(viewbox.width)) / svgDimensions.width
        )}
      ></path>
      {circles.map((circle) => (
        <Circle
          key={circle.id}
          id={circle.id}
          radius={String(
            (3.5 * parseFloat(viewbox.width)) / svgDimensions.width
          )}
          cx={circle.cx}
          cy={circle.cy}
          fill={circle.fill}
          handleMove={handleMove}
        ></Circle>
      ))}
    </svg>
  );
});
