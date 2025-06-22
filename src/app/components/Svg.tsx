import { forwardRef, useEffect, useMemo, useState } from "react";
import { usePathObject } from "@/context/PathContext";
import { Viewbox } from "@/types/Viewbox";
import {
  centerViewbox,
  createPathFromHoveredCommands,
  updatePoints,
} from "@/utils/path";
import { usePanZoom } from "@/hooks/usePanZoom";
import { createControlLines } from "@/utils/control-lines";
import ControlLines from "./control-lines";
import Points from "./points";

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

  const points = useMemo(
    () => updatePoints(pathObject.commands),
    [viewbox.height, viewbox.width, pathObject.commands]
  );
  const lines = useMemo(
    () => createControlLines(pathObject.commands, points),
    [pathObject.commands, points]
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
          <ControlLines
            lines={lines}
            viewboxWidth={viewbox.width}
            svgDimensionsWidth={svgDimensions.width}
          ></ControlLines>
          {hasActivePath && activePath && (
            <path
              d={activePath}
              stroke="deepskyblue"
              fill="transparent"
              strokeWidth={String((1.5 * viewbox.width) / svgDimensions.width)}
            ></path>
          )}
          <Points
            points={points}
            commands={pathObject.commands}
            updateCommands={updateCommands}
            setHasActivePath={setHasActivePath}
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
});
