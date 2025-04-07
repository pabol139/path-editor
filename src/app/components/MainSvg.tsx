"use client";
import { useRef, useState } from "react";
import Sidebar from "./Sidebar";
import { Viewbox } from "../types/Viewbox";
import { SvgDimensions } from "@/app/types/Svg";

import Svg from "./Svg";

export default function MainSvg() {
  const [viewbox, setViewbox] = useState<Viewbox>({
    x: "0",
    y: "0",
    width: "1000",
    height: "1000",
  });

  const [svgDimensions, setSvgDimensions] = useState<SvgDimensions>({
    width: 0,
    height: 0,
  });

  const svgRef = useRef<SVGSVGElement>(null);

  // Type for updateViewbox function
  const updateViewbox = (newObject: Viewbox) => {
    setViewbox((prevState) => ({
      ...prevState,
      ...newObject,
    }));
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
