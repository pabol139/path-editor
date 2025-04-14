"use client";
import { useRef, useState } from "react";
import Sidebar from "./Sidebar";
import { Viewbox } from "../types/Viewbox";
import { SvgDimensions } from "@/app/types/Svg";

import Svg from "./Svg";
import { formatNumber } from "../utils/pathUtils";

export default function MainSvg() {
  const [viewbox, setViewbox] = useState<Viewbox>({
    x: "0",
    y: "0",
    width: "1000",
    height: "1000",
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
        const height = parseFloat(prevState.height);
        const width = parseFloat(prevState.width);
        const aspectRatio = height / width;

        if (newObject.height !== prevState.height)
          newObject.width = String(parseFloat(newObject.height) / aspectRatio);
        else
          newObject.height = String(parseFloat(newObject.width) * aspectRatio);
      }

      return {
        ...prevState,
        x: formatNumber(parseFloat(newObject.x), 1),
        y: formatNumber(parseFloat(newObject.y), 1),
        width: formatNumber(parseFloat(newObject.width), 1),
        height: formatNumber(parseFloat(newObject.height), 1),
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
