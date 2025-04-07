import { useEffect, useRef } from "react";
import { usePathObject } from "../../context/PathContext";
import { Viewbox } from "../../types/Viewbox";
import { SvgDimensions } from "@/app/types/Svg";
import { getPathBBox } from "@/app/utils/pathUtils";
import { Copy } from "react-feather";

export default function PathInput({
  svgDimensions,
  updateViewbox,
}: {
  svgDimensions: SvgDimensions;
  updateViewbox: (viewbox: Viewbox) => void;
}) {
  const { pathObject, updatePath } = usePathObject();
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = event.target.value;
    const svgWidth = svgDimensions.width;
    const svgHeight = svgDimensions.height;
    const pathBBox = getPathBBox(value);

    let pathWidth = pathBBox.width + 2;
    let pathHeight = pathBBox.height + 2;
    const svgAspectRatio = svgHeight / svgWidth;
    const pathAspectRatio = pathHeight / pathWidth;
    if (svgAspectRatio < pathAspectRatio) {
      pathWidth = pathHeight / svgAspectRatio;
    } else {
      pathHeight = svgAspectRatio * pathWidth;
    }
    const newObject: Viewbox = {
      x: String(pathBBox.x - 1),
      y: String(pathBBox.y - 1),
      width: String(pathWidth),
      height: String(pathHeight),
    };

    updateViewbox(newObject);
    updatePath(value);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(pathObject.path).then(
      () => {
        if (!buttonRef.current) return;
        const textElement = buttonRef.current.querySelector("span");

        buttonRef.current.classList.add("copied");
        if (textElement) textElement.innerText = "Copied!";

        setTimeout(() => {
          if (!buttonRef.current) return;
          const textElement = buttonRef.current.querySelector("span");

          buttonRef.current.classList.remove("copied");
          if (textElement) textElement.innerText = "Copy";
        }, 4000);

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
        className="mt-2 w-full bg-secondary text-base tabular-nums"
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
        className="bg-[#2A2A2A] [&.copied]:bg-purple px-2 py-1 flex gap-2 text-sm items-center border border-tertiary rounded-md"
      >
        <Copy size={16}></Copy>
        <span>Copy</span>
      </button>
    </>
  );
}
