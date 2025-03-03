import { Viewbox } from "../types/Viewbox";
import ViewboxSection from "./Viewbox";
import TransformSection from "./transformations/Transforms";
import PathSection from "./path/Path";
import StyleSection from "./Styles";
import CommandsSection from "./commands/Commands";
import { RefObject } from "react";

type SiderbarProps = {
  viewbox: Viewbox;
  updateViewbox: (key: keyof Viewbox, value: string) => void;
};

export default function Sidebar({ viewbox, updateViewbox }: SiderbarProps) {
  return (
    <aside className="absolute overflow-auto border-l bg-primary border-secondary top-0 right-0 h-full text-tertiary w-full max-w-[var(--aside-width)]">
      <PathSection />

      <ViewboxSection viewbox={viewbox} updateViewbox={updateViewbox} />

      <TransformSection />

      {/* <StyleSection /> */}

      <CommandsSection />
    </aside>
  );
}
