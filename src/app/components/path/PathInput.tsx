import { useEffect, useRef, useState } from "react";
import { usePathObject } from "@/context/PathContext";
import { Viewbox } from "@/types/Viewbox";
import { SvgDimensions } from "@/types/Svg";
import { getPathBBox } from "@/utils/pathUtils";
import { Copy, Check } from "react-feather";
import clsx from "clsx";

export default function PathInput({
  svgDimensions,
  updateViewbox,
}: {
  svgDimensions: SvgDimensions;
  updateViewbox: (viewbox: Viewbox) => void;
}) {
  const { pathObject, updatePath, error } = usePathObject();
  const [copied, setCopied] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = event.target.value;
    if (!value.trim()) {
      updatePath(value);
      return;
    }

    const svgWidth = svgDimensions.width;
    const svgHeight = svgDimensions.height;
    const pathBBox = getPathBBox(value);

    let pathWidth = pathBBox.width;
    let pathHeight = pathBBox.height;
    let pathX = pathBBox.x;
    let pathY = pathBBox.y;
    const svgAspectRatio = svgHeight / svgWidth;
    const pathAspectRatio = pathHeight / pathWidth;
    if (svgAspectRatio < pathAspectRatio) {
      pathWidth = pathHeight / svgAspectRatio;
    } else {
      pathHeight = svgAspectRatio * pathWidth;
    }

    const percentFactorWidth = pathWidth * 0.1;
    const percentFactorHeight = pathHeight * 0.1;

    pathX = pathX - (pathWidth + percentFactorWidth - pathBBox.width) / 2;
    pathY = pathY - (pathHeight + percentFactorHeight - pathBBox.height) / 2;

    updateViewbox({
      x: pathX,
      y: pathY,
      width: pathWidth + percentFactorWidth,
      height: pathHeight + percentFactorHeight,
    });

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
        value={pathObject.path}
      ></textarea>
      <button
        ref={buttonRef}
        onClick={handleCopy}
        className={clsx(
          "bg-[#2A2A2A] transition-colors [&.copied]:bg-purple px-2 py-1 flex gap-2 text-sm items-center border border-tertiary rounded-md",
          copied && "copied"
        )}
      >
        {copied ? (
          <>
            <Check size={16}></Check>
            <span>Copied!</span>
          </>
        ) : (
          <>
            <Copy size={16}></Copy>
            <span>Copy</span>
          </>
        )}
      </button>
    </>
  );
}
