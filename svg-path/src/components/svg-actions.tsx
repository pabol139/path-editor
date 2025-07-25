import { usePathObject } from "@/context/PathContext";
import { usePanZoom } from "@/hooks/usePanZoom";
import { SvgDimensions } from "@/types/Svg";
import { Viewbox } from "@/types/Viewbox";
import { centerViewbox } from "@/utils/path";
import { Focus, Redo, SquareDashed, Undo } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { Square, ZoomIn, ZoomOut } from "react-feather";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

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
      message: "Undo",
    },
    {
      icon: <Redo></Redo>,
      onClick: handleRedo,
      disabled: redoStackIsEmpty,
      message: "Redo",
    },
    {
      icon: <ZoomIn></ZoomIn>,
      onClick: () => newHandleZoom(0),
      disabled: false,
      message: "Zoom In",
    },
    {
      icon: <ZoomOut></ZoomOut>,
      onClick: () => newHandleZoom(1),
      disabled: false,
      message: "Zoom Out",
    },
    {
      icon: <Focus></Focus>,
      onClick: () => centerViewbox(svgRef, updateViewbox, setSvgDimensions),
      disabled: false,
      message: "Fit",
    },
    {
      icon: isPathFilled ? <SquareDashed></SquareDashed> : <Square></Square>,
      onClick: handleFill,
      disabled: false,
      message: isPathFilled ? "Unfill" : "Fill",
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
      <TooltipProvider delayDuration={200}>
        {ACTIONS.map(({ icon, onClick, disabled, message }, key) => (
          <ActionTooltip key={key} message={message}>
            <button
              onClick={onClick}
              disabled={disabled}
              className=" px-1 py-1 rounded-sm h-10 w-10 flex items-center justify-center text-tertiary hover:bg-secondary transition-[background-color,opacity] disabled:opacity-50"
            >
              {icon}
            </button>
          </ActionTooltip>
        ))}
      </TooltipProvider>
    </motion.div>
  );
}

function ActionTooltip({
  message,
  children,
}: {
  message: string;
  children: React.ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent sideOffset={10}>
        <p>{message}</p>
      </TooltipContent>
    </Tooltip>
  );
}
