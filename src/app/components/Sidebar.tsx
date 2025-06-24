import { Viewbox } from "@/types/Viewbox";
import ViewboxSection from "@/components/Viewbox";
import TransformSection from "@/components/transformations/Transforms";
import PathSection from "@/components/path/Path";
import { SvgDimensions } from "@/types/Svg";
import CommandsSection from "@/components/commands/Commands";
import React from "react";

type SiderbarProps = {
  svgDimensions: SvgDimensions;
  viewbox: Viewbox;
  updateViewbox: (viewbox: Viewbox) => void;
};

export default function Sidebar({
  svgDimensions,
  viewbox,
  updateViewbox,
}: SiderbarProps) {
  return (
    <aside className="absolute overflow-auto border-l bg-primary border-secondary top-0 right-0 h-full text-tertiary w-full max-w-[var(--aside-width)]">
      <PathSection
        svgDimensions={svgDimensions}
        updateViewbox={updateViewbox}
      />

      <ViewboxSection viewbox={viewbox} updateViewbox={updateViewbox} />

      <TransformSection />

      {/* <StyleSection /> */}

      <CommandsSection />
    </aside>
  );
}
