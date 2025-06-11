import { forwardRef, useEffect, useState } from "react";
import { usePathObject } from "@/context/PathContext";
import { Viewbox } from "@/types/Viewbox";
import { updatePoints } from "@/utils/pathUtils";
import { Circle } from "@/components/Circle";
import { usePanZoom } from "@/hooks/usePanZoom";

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
  const [isVisible, setIsVisible] = useState(false);

  const circles = updatePoints(pathObject.commands);

  const {
    handlePointerDown,
    handlePointerLeave,
    handlePointerMove,
    handlePointerUp,
    handleZoom,
  } = usePanZoom(viewbox, updateViewbox);

  const svgRef = ref as React.RefObject<SVGSVGElement>;
  console.log({ circles });
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
          x: pathX,
          y: pathY,
          width: pathWidth + percentFactorWidth,
          height: pathHeight + percentFactorHeight,
        });

        setSvgDimensions({
          width: svgRef.current.getBoundingClientRect().width || 0,
          height: svgRef.current.getBoundingClientRect().height || 0,
        });
      }

      updateResize();
      setIsVisible(true);
      window.addEventListener("resize", updateResize);

      return () => {
        window.removeEventListener("resize", updateResize);
      };
    }
  }, []);

  const handleMove = (values: Coordinates) => {
    console.log(values);
    console.log(pathObject.commands);

    const circleInfo = circles.find((circle) => circle.id === values.id);
    if (!circleInfo) return;

    const newCommands = pathObject.commands.map((command) => {
      if (command.id !== circleInfo.id_command) return command; // Return unmodified command
      const coordinate_index = circleInfo.coordinate_index;
      // Create a new coordinates array to ensure immutability
      const newCoordinates = [...command.coordinates];

      switch (command.letter) {
        case "H":
          newCoordinates[coordinate_index] = values.x;
          break;
        case "V":
          newCoordinates[coordinate_index] = values.y;
          break;
        case "A":
          newCoordinates[coordinate_index] = values.x;
          newCoordinates[coordinate_index + 1] = values.y;
          break;
        case "C":
          newCoordinates[coordinate_index] = values.x;
          newCoordinates[coordinate_index + 1] = values.y;
          break;
        case "Q":
          newCoordinates[coordinate_index] = values.x;
          newCoordinates[coordinate_index + 1] = values.y;
          break;
        default:
          newCoordinates[coordinate_index] = values.x;
          newCoordinates[coordinate_index + 1] = values.y;
      }

      return { ...command, coordinates: newCoordinates }; // Return new object
    });

    updateCommands(newCommands);
  };

  return (
    <svg
      onWheel={handleZoom}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onPointerUp={handlePointerUp}
      ref={ref}
      className="w-[calc(100%-var(--aside-width))] h-full"
      viewBox={`${viewbox.x} ${viewbox.y} ${viewbox.width} ${viewbox.height}`}
    >
      {isVisible ? (
        <>
          <path
            d={pathObject.path}
            fill="#ffffff40"
            stroke="#fff"
            strokeWidth={String((1.5 * viewbox.width) / svgDimensions.width)}
          ></path>
          {circles.map((circle, index) => {
            const command = pathObject.commands.find(
              (command) => command.id === circle.id_command
            );

            return (
              (command?.letter === "C" || command?.letter === "Q") && (
                <Line
                  letter={command.letter}
                  circles={circles}
                  circle={circle}
                  viewbox={viewbox}
                  svgDimensions={svgDimensions}
                  index={index}
                ></Line>
              )
            );
          })}
          {circles.map((circle) => {
            return (
              <Circle
                id={circle.id}
                id_command={circle.id_command}
                radius={String((3.5 * viewbox.width) / svgDimensions.width)}
                cx={circle.cx}
                cy={circle.cy}
                handleMove={handleMove}
                fill={circle.control ? "#808080" : "#fff"}
              ></Circle>
            );
          })}
        </>
      ) : (
        <svg className="opacity-0">
          <path
            d={pathObject.path}
            fill="#ffffff40"
            stroke="#fff"
            strokeWidth={String((1.5 * viewbox.width) / svgDimensions.width)}
          ></path>
        </svg>
      )}
    </svg>
  );
});

function Line({ circles, circle, letter, viewbox, svgDimensions, index }) {
  const coordinate_index = circle.coordinate_index;

  let x1 = 0;
  let y1 = 0;
  let x2 = 0;
  let y2 = 0;

  if (letter === "C") {
    if (coordinate_index === 0) {
      x1 = circles[index - 1].cx;
      y1 = circles[index - 1].cy;
      x2 = circle.cx;
      y2 = circle.cy;
    } else if (coordinate_index === 2) {
      x1 = circles[index + 1].cx;
      y1 = circles[index + 1].cy;
      x2 = circle.cx;
      y2 = circle.cy;
    } else {
      return <></>;
    }
  } else {
    // Q
    if (coordinate_index === 0) {
      x1 = circles[index - 1].cx;
      y1 = circles[index - 1].cy;
      x2 = circle.cx;
      y2 = circle.cy;
    } else {
      x1 = circles[index - 1].cx;
      y1 = circles[index - 1].cy;
      x2 = circles[index].cx;
      y2 = circles[index].cy;
    }
  }
  return (
    <line
      stroke="gray"
      strokeWidth={String((1.5 * viewbox.width) / svgDimensions.width)}
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
    ></line>
  );
}
