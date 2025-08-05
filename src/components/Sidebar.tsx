import type { Viewbox } from "@/types/Viewbox";
import ViewboxSection from "@/components/viewbox";
import TransformSection from "@/components/transformations/Transforms";
import PathSection from "@/components/path/path";
import type { SvgDimensions } from "@/types/Svg";
import CommandsSection from "@/components/commands/commands";
import React from "react";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { PanelRight } from "lucide-react";

type SiderbarProps = {
  viewbox: Viewbox;
  updateViewbox: (viewbox: Viewbox) => void;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setSvgDimensions: React.Dispatch<React.SetStateAction<SvgDimensions>>;
};

export default function Sidebar({
  viewbox,
  updateViewbox,
  open,
  setOpen,
  setSvgDimensions,
}: SiderbarProps) {
  const shouldReduce = useReducedMotion();

  const handleOpen = (isOpen: boolean) => {
    setOpen(isOpen);
  };

  const variants = {
    hidden: shouldReduce
      ? { opacity: 1, x: "100%" }
      : { transform: "translateX(100%)" },
    visible: shouldReduce
      ? { opacity: 1, x: "0%" }
      : { transform: "translateX(0%)" },
  };

  return (
    <>
      <AnimatePresence initial={false}>
        {open && (
          <motion.aside
            key={"sidebar"}
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={variants}
            transition={{
              type: "tween",
              duration: 0.6,
              ease: [0.32, 0.72, 0, 1],
            }}
            aria-expanded={open}
            role="complementary"
            className="absolute top-0 right-0 h-full w-full md:w-auto motion-reduce:!transition-none"
          >
            {open && (
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
                  "absolute z-[100] right-1.5 items-center transition-transform h-fit top-0 flex gap-[2px] px-1 py-0.5 rounded-md"
                )}
              >
                <button
                  aria-label={`Close sidebar`}
                  className="px-1 py-1 rounded-sm -outline-offset-2 h-10 w-10 flex items-center justify-center text-tertiary opacity-70 hover:opacity-100 transition-opacity disabled:opacity-50"
                  onClick={() => handleOpen(false)}
                >
                  <PanelRight size={18}></PanelRight>
                </button>
              </motion.div>
            )}

            <div className="overflow-auto border-l bg-primary border-secondary h-full text-tertiary w-full md:max-w-[var(--aside-width)]">
              <PathSection
                updateViewbox={updateViewbox}
                setSvgDimensions={setSvgDimensions}
              />

              <ViewboxSection viewbox={viewbox} updateViewbox={updateViewbox} />

              <TransformSection />

              <CommandsSection />
            </div>
          </motion.aside>
        )}

        {!open && (
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
              "absolute z-20 active:scale-95 items-center right-4 h-fit top-4 flex gap-[2px] px-1 py-1  bg-primary rounded-md  border border-secondary shadow-md"
            )}
          >
            <button
              aria-label={`Open sidebar`}
              className="px-1 py-1 rounded-sm  h-9 w-9 flex items-center justify-center text-tertiary hover:bg-secondary transition-[background-color]"
              onClick={() => {
                handleOpen(true);
              }}
            >
              <PanelRight size={20}></PanelRight>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
