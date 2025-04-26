"use client";
import { useRef, useState } from "react";
import Sidebar from "@/components/Sidebar";
import { Viewbox } from "@/types/Viewbox";
import { SvgDimensions } from "@/types/Svg";

import Svg from "./Svg";
import { formatNumber } from "../utils/pathUtils";

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
      if (adaptAspectRatio) {
        const height = prevState.height;
        const width = prevState.width;
        const aspectRatio = height / width;

        if (newObject.height !== prevState.height)
          newObject.width = newObject.height / aspectRatio;
        else newObject.height = newObject.width * aspectRatio;
      }

      return {
        ...prevState,
        x: parseFloat(formatNumber(newObject.x, 1)),
        y: parseFloat(formatNumber(newObject.y, 1)),
        width: parseFloat(formatNumber(Math.max(newObject.width, 0), 1)),
        height: parseFloat(formatNumber(Math.max(newObject.height, 0), 1)),
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
