import { forwardRef, useEffect, useMemo, useState } from "react";
import { usePathObject } from "@/context/PathContext";
import { Viewbox } from "@/types/Viewbox";
import {
  centerViewbox,
  createLines,
  createPathFromHoveredCommands,
  getCurrentPositionBeforeCommand,
  isRelativeCommand,
  updatePoints,
} from "@/utils/path";
import { Circle } from "@/components/Circle";
import { usePanZoom } from "@/hooks/usePanZoom";
import { commandHandlers } from "@/utils/command-handler";

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
  const [hasActivePath, setHasActivePath] = useState(false);

  const circles = useMemo(
    () => updatePoints(pathObject.commands),
    [viewbox.height, viewbox.width, pathObject.commands]
  );
  const lines = useMemo(
    () => createLines(pathObject.commands, circles),
    [pathObject.commands, circles]
  );

  let activePath = "";

  if (hasActivePath) {
    activePath = createPathFromHoveredCommands(pathObject.commands);
  }
  const {
    handlePointerDown,
    handlePointerLeave,
    handlePointerMove,
    handlePointerUp,
    handleZoom,
  } = usePanZoom(viewbox, updateViewbox);

  const svgRef = ref as React.RefObject<SVGSVGElement>;

  useEffect(() => {
    if (svgRef?.current) {
      centerViewbox(svgRef, updateViewbox, setSvgDimensions);
      setIsVisible(true);
    }
  }, []);
  useEffect(() => {
    if (svgRef?.current) {
      function updateResize() {
        const path = svgRef.current?.querySelector("path");
        if (!path) return;

        const svgWidth = svgRef.current.getBoundingClientRect().width || 0;
        const svgHeight = svgRef.current.getBoundingClientRect().height || 0;
        const bbox = path.getBBox();
        const svgAspectRatio = svgHeight / svgWidth;

        let pathHeight = bbox.height;

        pathHeight = svgAspectRatio * viewbox.width;

        updateViewbox({
          ...viewbox,
          height: pathHeight,
        });

        setSvgDimensions({
          width: svgRef.current.getBoundingClientRect().width || 0,
          height: svgRef.current.getBoundingClientRect().height || 0,
        });
      }

      window.addEventListener("resize", updateResize);

      return () => {
        window.removeEventListener("resize", updateResize);
      };
    }
  }, [viewbox]);

  const handleMove = (values: Coordinates) => {
    const circleInfo = circles.find((circle) => circle.id === values.id);
    if (!circleInfo) return;

    const newCommands = pathObject.commands.map((command) => {
      if (command.id !== circleInfo.id_command) return command; // Return unmodified command
      const coordinate_index = circleInfo.coordinate_index;
      const handler = commandHandlers[command.letter.toLocaleUpperCase()];

      // Current point position to convert absolute to relative and viceversa
      const currentPos = getCurrentPositionBeforeCommand(
        pathObject.commands,
        command.id
      );

      const isRelative = isRelativeCommand(command.letter);
      // Create a new coordinates array to ensure immutability
      const newCoordinates = handler.updateCoordinates(
        command.coordinates,
        values.x,
        values.y,
        coordinate_index,
        currentPos,
        isRelative
      );

      return { ...command, coordinates: newCoordinates }; // Return new object
    });
    updateCommands(newCommands);
  };

  const handleEnter = (id_command: string) => {
    const { commands } = pathObject;
    const newCommands = commands.map((command) => {
      if (command.id !== id_command) return command; // Return unmodified command

      return { ...command, hovered: true }; // Return new object
    });

    setHasActivePath(true);
    updateCommands(newCommands);
  };

  const handleLeave = () => {
    const newCommands = pathObject.commands.map((command) => {
      return { ...command, hovered: false }; // Return new object
    });
    updateCommands(newCommands);
    setHasActivePath(false);
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
          {lines.map(({ x1, y1, x2, y2 }, index) => {
            return (
              <line
                key={index}
                stroke="gray"
                strokeWidth={String(
                  (1.5 * viewbox.width) / svgDimensions.width
                )}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
              ></line>
            );
          })}
          {hasActivePath && activePath && (
            <path
              d={activePath}
              stroke="deepskyblue"
              fill="transparent"
              strokeWidth={String((1.5 * viewbox.width) / svgDimensions.width)}
            ></path>
          )}
          {circles.map((circle) => {
            return (
              <Circle
                key={circle.id}
                circleObject={circle}
                radius={String((3.5 * viewbox.width) / svgDimensions.width)}
                strokeWidth={String((13 * viewbox.width) / svgDimensions.width)}
                handleMove={handleMove}
                handleEnter={handleEnter}
                handleLeave={handleLeave}
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
