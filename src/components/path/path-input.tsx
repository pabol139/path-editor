import { useEffect, useRef, useState } from "react";
import { usePathObject } from "@/context/path-context";
import type { Viewbox } from "@/types/Viewbox";
import type { SvgDimensions } from "@/types/Svg";
import { centerViewbox } from "@/utils/path";
import { Copy, Check } from "lucide-react";
import clsx from "clsx";

export default function PathInput({
  updateViewbox,
  setSvgDimensions,
}: {
  svgDimensions: SvgDimensions;
  updateViewbox: (viewbox: Viewbox) => void;
  setSvgDimensions: React.Dispatch<React.SetStateAction<SvgDimensions>>;
}) {
  const { pathObject, updatePath, error, svgRef } = usePathObject();
  const [copied, setCopied] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const { displayPath } = pathObject;
  const [justTyped, setJustTyped] = useState(false);

  // whenever the “real” path changes *and* it was triggered by typing *and* there's no error:
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
          }, 4000);
        }

        /* clipboard successfully set */
      },
      () => {
        /* clipboard write failed */
      }
    );
  };

  return (
    <>
      <textarea
        className={`mt-2 w-full bg-secondary text-base tabular-nums ${
          error ? "border-b border-red-600 text-[red]" : ""
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
      <button
        aria-label="Copy path to clipboard"
        ref={buttonRef}
        onClick={handleCopy}
        className={clsx(
          "bg-[#2A2A2A] transition-colors [&.copied]:bg-purple px-1 py-1 h-7 w-7 flex gap-2 text-sm items-center justify-center border border-tertiary rounded-md",
          copied && "copied"
        )}
      >
        {copied ? <Check size={16}></Check> : <Copy size={16}></Copy>}
      </button>
    </>
  );
}
