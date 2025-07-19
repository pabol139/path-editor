import { forwardRef, useEffect, useMemo, useState } from "react";
import { usePathObject } from "@/context/PathContext";
import { Viewbox } from "@/types/Viewbox";
import { centerViewbox, updatePoints } from "@/utils/path";
import { usePanZoom } from "@/hooks/usePanZoom";
import { createControlLines } from "@/utils/control-lines";
import ControlLines from "./control-lines";
import Points from "./points";
import OverlappedPaths from "./overlapped-paths";
import { createOverlappedPathsFromCommands } from "@/utils/overlapped-paths";
import useSvg from "@/hooks/useSvg";
import { SvgDimensions } from "@/types/Svg";

export default function Svg({
  viewbox,
  svgDimensions,
  setSvgDimensions,
  updateViewbox,
}: {
  viewbox: Viewbox;
  svgDimensions: SvgDimensions;
  setSvgDimensions: React.Dispatch<React.SetStateAction<SvgDimensions>>;
  updateViewbox: (viewbox: Viewbox) => void;
}) {
  const { pathObject, updateCommands, svgRef } = usePathObject();
  const { isVisible, points, overlappedPaths, lines, cleanSelectedCommands } =
    useSvg(viewbox, updateViewbox, setSvgDimensions);
  const {
    handlePointerDown,
    handlePointerLeave,
    handlePointerMove,
    handlePointerUp,
    handleZoom,
  } = usePanZoom(viewbox, updateViewbox, cleanSelectedCommands);

  return (
    <svg
      onWheel={handleZoom}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onPointerUp={handlePointerUp}
      ref={svgRef}
      className="w-[calc(100%-var(--aside-width))] h-full transition-[width] ease-sidebar duration-500"
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
          <ControlLines
            lines={lines}
            viewboxWidth={viewbox.width}
            svgDimensionsWidth={svgDimensions.width}
          ></ControlLines>
          <OverlappedPaths
            overlappedPaths={overlappedPaths}
            viewboxWidth={viewbox.width}
            svgDimensionsWidth={svgDimensions.width}
          ></OverlappedPaths>
          <Points
            points={points}
            commands={pathObject.commands}
            updateCommands={updateCommands}
            viewboxWidth={viewbox.width}
            svgDimensionsWidth={svgDimensions.width}
          ></Points>
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
}
