import type { Viewbox } from "@/types/Viewbox";
import ViewboxSection from "@/components/viewbox";
import TransformSection from "@/components/transformations/transforms";
import PathSection from "@/components/path/path";
import type { SvgDimensions } from "@/types/Svg";
import CommandsSection from "@/components/commands/commands";
import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { motion, useReducedMotion } from "motion/react";
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
  const [isMounted, setIsMounted] = useState(open);
  const [isVisible, setIsVisible] = useState(open);
  const asideRef = useRef<HTMLElement | null>(null);

  const handleOpen = (isOpen: boolean) => {
    setOpen(isOpen);
  };

  useEffect(() => {
    if (open) {
      setIsMounted(true);
      // update visibility in next frame
      requestAnimationFrame(() => {
        setIsVisible(true);
      });
      return;
    }

    setIsVisible(false);

    const el = asideRef.current;
    const onTransitionEnd = (ev: TransitionEvent) => {
      if (ev.propertyName !== "transform" && ev.propertyName !== "opacity")
        return;
      setIsMounted(false);
      if (el) el.removeEventListener("transitionend", onTransitionEnd);
    };

    if (el) {
      el.addEventListener("transitionend", onTransitionEnd);
    }

    return () => {
      if (el) el.removeEventListener("transitionend", onTransitionEnd);
    };
  }, [open]);

  return (
    <>
      {isMounted && (
        <aside
          ref={asideRef}
          aria-expanded={open}
          role="complementary"
          className={cn(
            "isolate z-20 absolute top-0 right-0 h-full w-full md:w-auto transition-transform  [transition-duration:_600ms] ease-sidebar motion-reduce:!transition-none",
            isVisible ? " translate-x-0" : " translate-x-full"
          )}
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

          <div className="flex flex-col border-l bg-primary border-secondary h-full text-tertiary w-full md:max-w-[var(--aside-width)]">
            <PathSection
              updateViewbox={updateViewbox}
              setSvgDimensions={setSvgDimensions}
            />
            <div className="flex-1 overflow-auto">
              <ViewboxSection viewbox={viewbox} updateViewbox={updateViewbox} />

              <TransformSection />

              <CommandsSection />
            </div>
          </div>
        </aside>
      )}

      {!open && (
        <motion.div
          key={"open"}
          initial={{ opacity: 0 }}
          animate={{
            opacity: 1,
            transition: {
              delay: shouldReduce ? 0 : 0.25,
            },
          }}
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
    </>
  );
}
