import { useEffect, useRef, useState } from "react";
import { usePathObject } from "@/context/path-context";
import type { Viewbox } from "@/types/Viewbox";
import type { SvgDimensions } from "@/types/Svg";
import { centerViewbox } from "@/utils/path";
import { Copy, Check } from "lucide-react";
import React from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";
import { isTouchDevice } from "@/utils/svg";

export default React.memo(function PathInput({
  updateViewbox,
  setSvgDimensions,
}: {
  updateViewbox: (viewbox: Viewbox) => void;
  setSvgDimensions: React.Dispatch<React.SetStateAction<SvgDimensions>>;
}) {
  const { pathObject, updatePath, error, svgRef } = usePathObject();
  const [copied, setCopied] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const [justTyped, setJustTyped] = useState(false);

  const { displayPath } = pathObject;

  // whenever the “real” path changes *and* it was triggered by typing in this input:
  useEffect(() => {
    if (justTyped && !error) {
      centerViewbox(svgRef, updateViewbox, setSvgDimensions);
    }
    setJustTyped(false);
  }, [pathObject.path, error]);

  const handleChange = (evt: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = evt.target.value;
    setJustTyped(true);
    updatePath(value);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(pathObject.path).then(
      () => {
        if (!buttonRef.current) return;
        if (!copied) {
          setCopied(true);
          setTimeout(() => {
            setCopied(false);
          }, 2000);
        }

        /* clipboard successfully set */
      },
      () => {
        /* clipboard write failed */
      }
    );
  };

  // const handleGenerateRandom = () => {
  //   const pathListLength = PATH_LIST.length;
  //   const nextPathNumber = pathNumberRef.current + 1;

  //   updatePath(PATH_LIST[pathNumberRef.current]);
  //   setJustTyped(true);

  //   pathNumberRef.current =
  //     nextPathNumber >= pathListLength ? 0 : nextPathNumber;
  // };

  return (
    <>
      <textarea
        className={`mt-2.5 w-full bg-secondary text-[calc((15_/_16)_*_1rem)] tabular-nums ${
          error ? "!border-b-2 border-red-600" : ""
        }`}
        name=""
        id=""
        cols={30}
        rows={3}
        onChange={handleChange}
        onKeyDown={(e) => {
          if (e.ctrlKey && e.key.toLocaleLowerCase() === "z") {
            e.preventDefault();
          }
        }}
        value={displayPath}
      ></textarea>
      <div className="flex gap-2 mt-1">
        <button
          aria-label="Copy path to clipboard"
          ref={buttonRef}
          onClick={handleCopy}
          className={cn(
            "bg-[#2A2A2A] px-1 py-1 h-8 w-8 flex gap-2 text-sm items-center justify-center border border-gray300 rounded-md active:scale-95 transition-transform",
            copied && "copied",
            isTouchDevice() && "w-9 h-9"
          )}
        >
          <AnimatePresence initial={false} mode="wait">
            {copied ? (
              <motion.span
                key={"Copied"}
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                transition={{
                  type: "spring",
                  duration: 0.1,
                  bounce: 0.15,
                }}
              >
                <Check size={16}></Check>
              </motion.span>
            ) : (
              <motion.span
                key={"Copy"}
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                transition={{
                  type: "spring",
                  duration: 0.1,
                  bounce: 0.15,
                }}
              >
                <Copy size={16}></Copy>
              </motion.span>
            )}
          </AnimatePresence>
        </button>
        {/* <button
          aria-label="Generate random path"
          onClick={handleGenerateRandom}
          className={cn(
            "bg-[#2A2A2A] px-1 py-1 h-8 w-8 flex gap-2 text-sm items-center justify-center border border-gray300 rounded-md active:scale-95 transition-transform",
            copied && "copied",
            isTouchDevice() && "w-9 h-9"
          )}
        >
          <AnimatePresence initial={false} mode="wait">
            <motion.span
              key={"Copied"}
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{
                type: "spring",
                duration: 0.1,
                bounce: 0.15,
              }}
            >
              <WandSparkles size={16}></WandSparkles>
            </motion.span>
          </AnimatePresence>
        </button> */}
      </div>
    </>
  );
});
