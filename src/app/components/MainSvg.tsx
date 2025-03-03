"use client";
import { useRef, useState } from "react";
import Sidebar from "./Sidebar";
import { Viewbox } from "../types/Viewbox";
import Svg from "./Svg";

export default function MainSvg() {
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
  };

  return (
    <>
      <Svg viewbox={viewbox}></Svg>
      <Sidebar viewbox={viewbox} updateViewbox={updateViewbox} />
    </>
  );
}
