"use client";
import { useState } from "react";
import Sidebar from "@/components/sidebar";
import Svg from "@/components/svg/svg";
import type { Viewbox } from "@/types/Viewbox";
import type { SvgDimensions } from "@/types/Svg";
import { formatNumberToString } from "@/utils/path";
import SvgActions from "./toolbar";
import { cn } from "@/lib/utils";

export default function Wrapper() {
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

  const [isSidebarOpen, setisSidebarOpen] = useState(true);
  const [showControlElements, setShowControlElements] = useState(true);

  // Type for updateViewbox function
  const updateViewbox = (
    newObject: Viewbox,
    adaptAspectRatio: Boolean = false
  ) => {
    setViewbox((prevState) => {
      const { height: oldHeight, width: oldWidth } = prevState;
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
        x: parseFloat(formatNumberToString(newObject.x, 2)),
        y: parseFloat(formatNumberToString(newObject.y, 2)),
        width: parseFloat(
          formatNumberToString(Math.max(newObject.width, 0), 2)
        ),
        height: parseFloat(
          formatNumberToString(Math.max(newObject.height, 0), 2)
        ),
      };
    });
  };

  return (
    <>
      <div
        className={cn(
          "relative h-full w-[calc(100%-var(--aside-width))] transition-[width] ease-out-sidebar duration-500",
          !isSidebarOpen && "w-full"
        )}
      >
        <Svg
          showControlElements={showControlElements}
          svgDimensions={svgDimensions}
          setSvgDimensions={setSvgDimensions}
          viewbox={viewbox}
          updateViewbox={updateViewbox}
          isSidebarOpen={isSidebarOpen}
        ></Svg>
        <SvgActions
          viewbox={viewbox}
          updateViewbox={updateViewbox}
          setSvgDimensions={setSvgDimensions}
          showControlElements={showControlElements}
          setShowControlElements={setShowControlElements}
        ></SvgActions>
      </div>
      <Sidebar
        svgDimensions={svgDimensions}
        viewbox={viewbox}
        updateViewbox={updateViewbox}
        open={isSidebarOpen}
        setOpen={setisSidebarOpen}
        setSvgDimensions={setSvgDimensions}
      />
    </>
  );
}
