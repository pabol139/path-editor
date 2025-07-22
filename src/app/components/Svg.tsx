import { usePathObject } from "@/context/PathContext";
import { Viewbox } from "@/types/Viewbox";
import { usePanZoom } from "@/hooks/usePanZoom";
import ControlLines from "./control-lines";
import Points from "./points";
import OverlappedPaths from "./overlapped-paths";
import useSvg from "@/hooks/useSvg";
import { SvgDimensions } from "@/types/Svg";
import DecorativeLines from "./decorative-lines";

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
  const { pathObject, svgRef } = usePathObject();
  const { isVisible, points, overlappedPaths, lines, cleanSelectedCommands } =
    useSvg(viewbox, updateViewbox, setSvgDimensions);
  const {
    handlePointerDown,
    handlePointerLeave,
    handlePointerMove,
    handlePointerUp,
    handleWheelZoom,
  } = usePanZoom(viewbox, updateViewbox, cleanSelectedCommands);

  return (
    <svg
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
          <DecorativeLines
            viewbox={viewbox}
            strokeWidth={String((1.5 * viewbox.width) / svgDimensions.width)}
          ></DecorativeLines>
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
