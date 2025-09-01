import React from "react";
import { usePathObject } from "@/context/path-context";
import type { Viewbox } from "@/types/Viewbox";
import { usePanZoom } from "@/hooks/usePanZoom";
import ControlLines from "./control-lines";
import PointsWrapper from "./points-wrapper";
import OverlappedPaths from "./overlapped-paths";
import useSvg from "@/hooks/useSvg";
import type { SvgDimensions } from "@/types/Svg";
import DecorativeLines from "./decorative-lines";
import {
  cleanSelectedAndHoveredCommands,
  onPointerDownCommand,
} from "@/utils/path";
import { isTouchDevice } from "@/utils/svg";
import { useCallback, useEffect } from "react";

function Svg({
  showControlElements = true,
  isSidebarOpen = true,
  viewbox,
  svgDimensions,
  setSvgDimensions,
  updateViewbox,
}: {
  showControlElements?: boolean;
  isSidebarOpen?: boolean;
  viewbox: Viewbox;
  svgDimensions: SvgDimensions;
  setSvgDimensions: React.Dispatch<React.SetStateAction<SvgDimensions>>;
  updateViewbox: (viewbox: Viewbox) => void;
}) {
  const {
    pathObject: { commands, path },
    svgRef,
    updateCommands,
  } = usePathObject();
  const { isVisible, points, overlappedPaths, lines } = useSvg(
    viewbox,
    updateViewbox,
    setSvgDimensions
  );

  function formatCommands() {
    const formatedCommands = cleanSelectedAndHoveredCommands(commands);
    updateCommands(formatedCommands, false);
  }

  const { handleWheelZoom, startDrag, drag, stopDrag } = usePanZoom(
    viewbox,
    updateViewbox,
    formatCommands
  );

  const handlePointsPointerDown = useCallback(
    (id_command: string) => {
      onPointerDownCommand(
        commands,
        updateCommands,
        id_command,
        true,
        isSidebarOpen
      );
    },
    [commands, updateCommands, isSidebarOpen]
  );

  // Manual wheel event to remove default pinch zoom on trackpad
  useEffect(() => {
    if (svgRef.current)
      svgRef.current.addEventListener("wheel", handleWheelZoom, {
        passive: false,
      });

    return () => {
      svgRef.current?.removeEventListener("wheel", handleWheelZoom);
    };
  }, [handleWheelZoom]);

  const linesWidth = String((1.5 * viewbox.width) / svgDimensions.width);
  const pointWidth = String((3.5 * viewbox.width) / svgDimensions.width);
  const pointStrokeWidth = isTouchDevice()
    ? String((33 * viewbox.width) / svgDimensions.width)
    : String((13 * viewbox.width) / svgDimensions.width);

  return (
    <svg
      role="application"
      aria-label="Path editor"
      onMouseDown={startDrag}
      onTouchStart={startDrag}
      onTouchMove={drag}
      onMouseMove={drag}
      onMouseUp={stopDrag}
      onTouchEnd={stopDrag}
      onContextMenu={(e) => {
        isTouchDevice() && e.preventDefault();
      }}
      ref={svgRef}
      className="h-full w-full !touch-none !select-none"
      viewBox={`${viewbox.x} ${viewbox.y} ${viewbox.width} ${viewbox.height}`}
    >
      {isVisible ? (
        <>
          {showControlElements && (
            <DecorativeLines
              viewbox={viewbox}
              strokeWidth={linesWidth}
              svgRef={svgRef}
            ></DecorativeLines>
          )}
          <path
            role="img"
            aria-label={`SVG path with ${commands.length} commands`}
            d={path}
            fill="#ffffff40"
            stroke="#fff"
            strokeWidth={linesWidth}
          ></path>
          {showControlElements && (
            <>
              <ControlLines
                lines={lines}
                linesWidth={linesWidth}
              ></ControlLines>
              <OverlappedPaths
                overlappedPaths={overlappedPaths}
                linesWidth={linesWidth}
              ></OverlappedPaths>
              <PointsWrapper
                viewbox={viewbox}
                points={points}
                pointWidth={pointWidth}
                pointStrokeWidth={pointStrokeWidth}
                handlePointerDown={handlePointsPointerDown}
              ></PointsWrapper>
            </>
          )}
        </>
      ) : (
        <>
          <p className="text-[#13171B]">Loading...</p>
          <svg className="opacity-0">
            <path
              d={path}
              fill="#ffffff40"
              stroke="#fff"
              strokeWidth={linesWidth}
            ></path>
          </svg>
        </>
      )}
    </svg>
  );
}

export default React.memo(Svg);
