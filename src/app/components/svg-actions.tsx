import { usePathObject } from "@/context/PathContext";
import { usePanZoom } from "@/hooks/usePanZoom";
import { SvgDimensions } from "@/types/Svg";
import { Viewbox } from "@/types/Viewbox";
import { centerViewbox } from "@/utils/path";
import { Focus, Redo, SquareDashed, Undo } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { Square, ZoomIn, ZoomOut } from "react-feather";

export default function SvgActions({
  viewbox,
  updateViewbox,
  setSvgDimensions,
}: {
  viewbox: Viewbox;
  updateViewbox: (viewbox: Viewbox) => void;
  setSvgDimensions: React.Dispatch<React.SetStateAction<SvgDimensions>>;
}) {
  const {
    svgRef,
    undoUtils: { undoStack, redoStack, handleUndo, handleRedo },
  } = usePathObject();
  const { handleProgrammaticZoom } = usePanZoom(viewbox, updateViewbox, null);
  const [isPathFilled, setIsPathFilled] = useState(() => getIsPathFilled());

  const undoStackIsEmpty = undoStack.length <= 0;
  const redoStackIsEmpty = redoStack.length <= 0;

  function getIsPathFilled() {
    const fill = svgRef.current?.querySelector("path")?.getAttribute("fill");
    return fill !== "" && fill !== "transparent" && fill !== null;
  }

  function handleFill() {
    if (!svgRef.current) return;
    const currentlyFilled = getIsPathFilled();
    if (currentlyFilled) {
      svgRef.current.querySelector("path")?.setAttribute("fill", "transparent");
      setIsPathFilled(false);
    } else {
      svgRef.current.querySelector("path")?.setAttribute("fill", "#ffffff40");
      setIsPathFilled(true);
    }
  }

  function newHandleZoom(value: number) {
    if (svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      handleProgrammaticZoom(value, { x: rect.width / 2, y: rect.height / 2 });
    }
  }

  const ACTIONS = [
    {
      icon: <Undo></Undo>,
      onClick: handleUndo,
      disabled: undoStackIsEmpty,
    },
    {
      icon: <Redo></Redo>,
      onClick: handleRedo,
      disabled: redoStackIsEmpty,
    },
    {
      icon: <ZoomIn></ZoomIn>,
      onClick: () => newHandleZoom(0),
      disabled: false,
    },
    {
      icon: <ZoomOut></ZoomOut>,
      onClick: () => newHandleZoom(1),
      disabled: false,
    },
    {
      icon: <Focus></Focus>,
      onClick: () => centerViewbox(svgRef, updateViewbox, setSvgDimensions),
      disabled: false,
    },
    {
      icon: isPathFilled ? <SquareDashed></SquareDashed> : <Square></Square>,
      onClick: handleFill,
      disabled: false,
    },
  ];

  return (
    <motion.div
      transition={{
        type: "spring",
        duration: 0.5,
        bounce: 0.15,
      }}
      initial={{ y: 75 }}
      animate={{ y: -50 }}
      className="absolute right-0 left-0 bottom-0 m-auto w-fit flex gap-[2px] bg-primary px-1 py-1 rounded-md border border-secondary shadow-md"
    >
      {ACTIONS.map(({ icon, onClick, disabled }, key) => (
        <button
          key={key}
          onClick={onClick}
          disabled={disabled}
          className=" px-1 py-1 rounded-sm h-10 w-10 flex items-center justify-center text-tertiary hover:bg-secondary transition-[background-color,opacity] disabled:opacity-50"
        >
          {icon}
        </button>
      ))}
    </motion.div>
  );
}
