import { usePathObject } from "@/context/path-context";
import { useEffect, useMemo, useState } from "react";
import { centerViewbox, updatePoints } from "@/utils/path";
import { createControlLines } from "@/utils/control-lines";
import { createOverlappedPathsFromCommands } from "@/utils/overlapped-paths";
import type { Viewbox } from "@/types/Viewbox";
import type { SvgDimensions } from "@/types/Svg";

export default function useSvg(
  viewbox: Viewbox,
  updateViewbox: (viewbox: Viewbox) => void,
  setSvgDimensions: React.Dispatch<React.SetStateAction<SvgDimensions>>
) {
  const { pathObject, svgRef } = usePathObject();
  const { commands } = pathObject;
  const [isVisible, setIsVisible] = useState(false);

  const points = useMemo(
    () => updatePoints(commands),
    [viewbox.height, viewbox.width, commands]
  );
  const lines = useMemo(
    () => createControlLines(commands, points),
    [commands, points]
  );

  const overlappedPaths = useMemo(
    () => createOverlappedPathsFromCommands(commands),
    [commands]
  );

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

        const svgWidth = svgRef.current?.getBoundingClientRect().width || 0;
        const svgHeight = svgRef.current?.getBoundingClientRect().height || 0;
        const bbox = path.getBBox();
        const svgAspectRatio = svgHeight / svgWidth;

        let pathHeight = bbox.height;

        pathHeight = svgAspectRatio * viewbox.width;

        updateViewbox({
          ...viewbox,
          height: pathHeight,
        });

        setSvgDimensions({
          width: svgRef.current?.getBoundingClientRect().width || 0,
          height: svgRef.current?.getBoundingClientRect().height || 0,
        });
      }

      window.addEventListener("resize", updateResize);

      return () => {
        window.removeEventListener("resize", updateResize);
      };
    }
  }, [viewbox]);

  return {
    isVisible,
    points,
    lines,
    overlappedPaths,
  };
}
