"use client";
import { useState } from "react";
import Sidebar from "./Sidebar";
import { Viewbox } from "../types/Viewbox";

export default function MainSvg() {
  const [viewbox, setViewbox] = useState<Viewbox>({
    x: -230,
    y: -140,
    width: 1200,
    height: 1000,
  });

  // Type for updateViewbox function
  const updateViewbox = (key: keyof Viewbox, value: number) => {
    setViewbox((prevState) => ({
      ...prevState,
      [key]: value,
    }));
  };

  return (
    <>
      <svg
        className="w-full min-h-full"
        viewBox={`${viewbox.x} ${viewbox.y} ${viewbox.width} ${viewbox.height}`}
      >
        <path
          d="M 200 500 H 500 L 500 220 L 200 220 z"
          fill="#ffffff40"
          stroke="#fff"
          strokeWidth={1}
        ></path>
      </svg>
      <Sidebar viewbox={viewbox} setViewbox={updateViewbox} />
    </>
  );
}
