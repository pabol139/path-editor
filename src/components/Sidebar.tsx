import type { Viewbox } from "@/types/Viewbox";
import ViewboxSection from "@/components/Viewbox";
import TransformSection from "@/components/transformations/Transforms";
import PathSection from "@/components/path/Path";
import type { SvgDimensions } from "@/types/Svg";
import CommandsSection from "@/components/commands/Commands";
import React, { useState } from "react";
import { ArrowRight } from "lucide-react";
import { usePathObject } from "@/context/PathContext";

type SiderbarProps = {
  svgDimensions: SvgDimensions;
  viewbox: Viewbox;
  updateViewbox: (viewbox: Viewbox) => void;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function Sidebar({
  svgDimensions,
  viewbox,
  updateViewbox,
  open,
  setOpen,
}: SiderbarProps) {
  const { svgRef } = usePathObject();

  const handleOpen = (isOpen: boolean) => {
    // if (svgRef.current && svgRef.current.parentElement) {
    //   if (isOpen) {
    //     svgRef.current.parentElement.style.width =
    //       "calc(100% - var(--aside-width))";
    //   } else {
    //     svgRef.current.parentElement.style.width = "100%";
    //   }
    // }

    setOpen(isOpen);
  };
  return (
    <aside
      className={`absolute top-0 right-0 h-full transition-transform ease-out-sidebar duration-500 ${
        open ? "" : "translate-x-full"
      }`}
    >
      <div className="overflow-auto border-l bg-primary border-secondary top-0 right-0 h-full text-tertiary w-full max-w-[var(--aside-width)]">
        <PathSection
          svgDimensions={svgDimensions}
          updateViewbox={updateViewbox}
        />

        <ViewboxSection viewbox={viewbox} updateViewbox={updateViewbox} />

        <TransformSection />

        {/* <StyleSection /> */}

        <CommandsSection />
      </div>
      <div className="absolute -left-0 -translate-x-[110%]  flex items-center  m-auto h-fit top-16 pointer-events-none">
        <button
          className="bg-secondary px-1 py-1 rounded-sm h-10 text-tertiary border border-tertiary pointer-events-auto"
          onClick={() => handleOpen(!open)}
        >
          <ArrowRight
            size={16}
            className={`transition-transform ${open ? "" : "rotate-180"}`}
          ></ArrowRight>
        </button>
      </div>
    </aside>
  );
}
