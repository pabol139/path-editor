import type { Viewbox } from "@/types/Viewbox";
import ViewboxSection from "@/components/viewbox";
import TransformSection from "@/components/transformations/Transforms";
import PathSection from "@/components/path/path";
import type { SvgDimensions } from "@/types/Svg";
import CommandsSection from "@/components/commands/commands";
import React from "react";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "motion/react";
import { PanelRight } from "lucide-react";

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
      aria-expanded={open}
      className={`isolate absolute z-20 top-0 right-0 h-full transition-transform ease-out-sidebar duration-500 w-full md:w-auto ${
        open ? "" : "translate-x-full"
      }`}
    >
      <div className="overflow-auto border-l bg-primary border-secondary h-full text-tertiary w-full md:max-w-[var(--aside-width)]">
        <PathSection
          svgDimensions={svgDimensions}
          updateViewbox={updateViewbox}
          setSvgDimensions={setSvgDimensions}
        />

        <ViewboxSection viewbox={viewbox} updateViewbox={updateViewbox} />

        <TransformSection />

        <CommandsSection />
      </div>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            key={"close"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{
              opacity: 0,
              transition: {
                duration: 0.1,
              },
            }}
            className={cn(
              "absolute z-20 right-1.5 items-center transition-transform h-fit top-0 flex gap-[2px] px-1 py-0.5 rounded-md"
            )}
          >
            <button
              aria-label={`Close sidebar`}
              className="px-1 py-1 rounded-sm h-9 w-9 flex items-center justify-center text-tertiary opacity-70 hover:opacity-100 hover:bg-secondary transition-[background-color,opacity] disabled:opacity-50"
              onClick={() => handleOpen(false)}
            >
              <PanelRight size={18}></PanelRight>
            </button>
          </motion.div>
        ) : (
          <motion.div
            key={"open"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{
              opacity: 0,
              transition: {
                duration: 0.15,
              },
            }}
            className={cn(
              "absolute z-20 items-center -left-4 -translate-x-full h-fit top-4 flex gap-[2px] px-1 py-1  bg-primary rounded-md  border border-secondary shadow-md"
            )}
          >
            <button
              aria-label={`Open sidebar`}
              className="px-1 py-1 rounded-sm h-9 w-9 flex items-center justify-center text-tertiary hover:bg-secondary transition-[background-color]"
              onClick={() => handleOpen(true)}
            >
              <PanelRight size={20}></PanelRight>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </aside>
  );
}
