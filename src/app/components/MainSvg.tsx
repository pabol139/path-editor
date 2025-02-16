"use client";
import { useState } from "react";
import Sidebar from "./Sidebar";
import { Viewbox } from "../types/Viewbox";
import { usePath } from "../context/PathContext";

export default function MainSvg() {
  const path = usePath();

  const [viewbox, setViewbox] = useState<Viewbox>({
    x: "-230",
    y: "-140",
    width: "1200",
    height: "1000",
  });

  // Type for updateViewbox function
  const updateViewbox = (key: keyof Viewbox, value: string) => {
    setViewbox((prevState) => ({
      ...prevState,
      [key]: value,
    }));

    console.log(viewbox);
  };

  return (
    <>
      <svg
        className="w-[calc(100%-var(--aside-width))] h-full"
        viewBox={`${viewbox.x} ${viewbox.y} ${viewbox.width} ${viewbox.height}`}
      >
        <path d={path} fill="#ffffff40" stroke="#fff" strokeWidth={1}></path>
      </svg>
      <Sidebar viewbox={viewbox} updateViewbox={updateViewbox} />
    </>
  );
}
