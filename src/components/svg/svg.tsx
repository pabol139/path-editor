import { usePathObject } from "@/context/path-context";
import type { Viewbox } from "@/types/Viewbox";
import { usePanZoom } from "@/hooks/usePanZoom";
import ControlLines from "./control-lines";
import Points from "./points";
import OverlappedPaths from "./overlapped-paths";
import useSvg from "@/hooks/useSvg";
import type { SvgDimensions } from "@/types/Svg";
import DecorativeLines from "./decorative-lines";
import {
  cleanSelectedAndHoveredCommands,
  onPointerDownCommand,
} from "@/utils/path";

export default function Svg({
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

  const {
    handlePointerDown,
    handlePointerLeave,
    handlePointerMove,
    handlePointerUp,
    handleWheelZoom,
  } = usePanZoom(viewbox, updateViewbox, formatCommands);

  const handlePointsPointerDown = (id_command: string) => {
    onPointerDownCommand(
      commands,
      updateCommands,
      id_command,
      true,
      isSidebarOpen
    );
  };

  return (
    <svg
      role="application"
      aria-label="Path editor"
      onWheel={handleWheelZoom}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onPointerUp={handlePointerUp}
      ref={svgRef}
      className="h-full w-full"
      viewBox={`${viewbox.x} ${viewbox.y} ${viewbox.width} ${viewbox.height}`}
    >
      {isVisible ? (
        <>
          {showControlElements && (
            <DecorativeLines
              viewbox={viewbox}
              strokeWidth={String((1.5 * viewbox.width) / svgDimensions.width)}
              svgRef={svgRef}
            ></DecorativeLines>
          )}
          <path
            role="img"
            aria-label={`SVG path with ${commands.length} commands`}
            d={path}
            fill="#ffffff40"
            stroke="#fff"
            strokeWidth={String((1.5 * viewbox.width) / svgDimensions.width)}
          ></path>
          {showControlElements && (
            <>
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
                viewboxWidth={viewbox.width}
                svgDimensionsWidth={svgDimensions.width}
                handlePointerDown={handlePointsPointerDown}
              ></Points>
            </>
          )}
        </>
      ) : (
        <svg className="opacity-0">
          <path
            d={path}
            fill="#ffffff40"
            stroke="#fff"
            strokeWidth={String((1.5 * viewbox.width) / svgDimensions.width)}
          ></path>
        </svg>
      )}
    </svg>
  );
}
