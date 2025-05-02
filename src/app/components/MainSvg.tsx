"use client";
import { useRef, useState } from "react";
import Sidebar from "@/components/Sidebar";
import Svg from "@/components/Svg";
import { Viewbox } from "@/types/Viewbox";
import { SvgDimensions } from "@/types/Svg";
import { formatNumber } from "@/utils/pathUtils";

export default function MainSvg() {
  const [viewbox, setViewbox] = useState<Viewbox>({
    x: 0,
    y: 0,
    width: 1000,
    height: 1000,
  });

  const [svgDimensions, setSvgDimensions] = useState<SvgDimensions>({
    width: 1,
    height: 1,
  });

  const svgRef = useRef<SVGSVGElement>(null);
  // Type for updateViewbox function
  const updateViewbox = (
    newObject: Viewbox,
    adaptAspectRatio: Boolean = false
  ) => {
    setViewbox((prevState) => {
      const { height: oldHeight, width: oldWidth } = prevState;
      const { height, width } = newObject;

      if (adaptAspectRatio) {
        const aspectRatio = oldHeight / oldWidth || 0;

        if (newObject.height !== oldHeight) {
          newObject.width = newObject.height / aspectRatio;
          newObject.width = newObject.height / aspectRatio;
        } else {
          newObject.height = newObject.width * aspectRatio;
          newObject.height = newObject.width * aspectRatio;
        }
      }

      return {
        ...prevState,
        x: parseFloat(formatNumber(newObject.x, 2)),
        y: parseFloat(formatNumber(newObject.y, 2)),
        width: parseFloat(formatNumber(Math.max(newObject.width, 0), 2)),
        height: parseFloat(formatNumber(Math.max(newObject.height, 0), 2)),
      };
    });
  };

  return (
    <>
      <Svg
        ref={svgRef}
        svgDimensions={svgDimensions}
        setSvgDimensions={setSvgDimensions}
        viewbox={viewbox}
        updateViewbox={updateViewbox}
      ></Svg>
      <Sidebar
        svgDimensions={svgDimensions}
        viewbox={viewbox}
        updateViewbox={updateViewbox}
      />
    </>
  );
}
