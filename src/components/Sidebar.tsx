import type { Viewbox } from "@/types/Viewbox";
import ViewboxSection from "@/components/viewbox";
import TransformSection from "@/components/transformations/Transforms";
import PathSection from "@/components/path/path";
import type { SvgDimensions } from "@/types/Svg";
import CommandsSection from "@/components/commands/commands";
import React from "react";
import { ArrowRight } from "lucide-react";

type SiderbarProps = {
  svgDimensions: SvgDimensions;
  viewbox: Viewbox;
  updateViewbox: (viewbox: Viewbox) => void;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setSvgDimensions: React.Dispatch<React.SetStateAction<SvgDimensions>>;
};

export default function Sidebar({
  svgDimensions,
  viewbox,
  updateViewbox,
  open,
  setOpen,
  setSvgDimensions,
}: SiderbarProps) {
  const handleOpen = (isOpen: boolean) => {
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
          setSvgDimensions={setSvgDimensions}
        />

        <ViewboxSection viewbox={viewbox} updateViewbox={updateViewbox} />

        <TransformSection />

        {/* <StyleSection /> */}

        <CommandsSection />
      </div>
      <div className="absolute -left-4 -translate-x-[100%] shadow-md flex items-center  m-auto h-fit top-4 pointer-events-none">
        <button
          className="bg-secondary px-1 py-1 rounded-sm h-10 text-tertiary border border-tertiary/50 pointer-events-auto"
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
