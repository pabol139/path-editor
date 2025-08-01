import { usePathObject } from "@/context/path-context";
import { usePanZoom } from "@/hooks/usePanZoom";
import type { SvgDimensions } from "@/types/Svg";
import type { Viewbox } from "@/types/Viewbox";
import { centerViewbox } from "@/utils/path";
import { Minus, Plus, Redo, Spline, SquareDashed, Undo } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { Square } from "lucide-react";
import { TooltipProvider } from "./ui/tooltip";
import { Focus } from "./animated-icons/focus";
import ToolbarAction from "./toolbar-action";
import { SplinePointer } from "./animated-icons/spline-pointer";

export default function Toolbar({
  viewbox,
  updateViewbox,
  setSvgDimensions,
  showControlElements,
  setShowControlElements,
}: {
  viewbox: Viewbox;
  updateViewbox: (viewbox: Viewbox) => void;
  setSvgDimensions: React.Dispatch<React.SetStateAction<SvgDimensions>>;
  showControlElements: boolean;
  setShowControlElements: React.Dispatch<React.SetStateAction<boolean>>;
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

  const UNDO_ACTIONS = [
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
  ];

  const ZOOM_ACTIONS = [
    {
      icon: <Minus></Minus>,
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
      icon: <Plus></Plus>,
      onClick: () => newHandleZoom(0),
      disabled: false,
      message: "Zoom In",
    },
  ];

  const STYLING_ACTIONS = [
    {
      icon: isPathFilled ? <Square></Square> : <SquareDashed></SquareDashed>,
      onClick: handleFill,
      disabled: false,
      message: isPathFilled ? "Unfill" : "Fill",
    },
    {
      icon: showControlElements ? (
        <SplinePointer></SplinePointer>
      ) : (
        <Spline></Spline>
      ),
      onClick: () => setShowControlElements(!showControlElements),
      disabled: false,
      message: showControlElements ? "Hide controls" : "Show controls",
    },
  ];

  return (
    <>
      <TooltipProvider delayDuration={200}>
        <motion.div
          role="toolbar"
          transition={{
            type: "spring",
            duration: 0.5,
            bounce: 0.15,
          }}
          initial={{ y: 75 }}
          animate={{ y: -16 }}
          className=" absolute left-4 bottom-0 m-auto w-fit flex gap-3"
        >
          <div className="flex gap-[2px] bg-primary px-1 py-1 rounded-md border border-secondary shadow-md">
            {ZOOM_ACTIONS.map(({ icon, onClick, disabled, message }) => (
              <ToolbarAction
                key={message}
                icon={icon}
                onClick={onClick}
                disabled={disabled}
                message={message}
              ></ToolbarAction>
            ))}
          </div>
          <div className="flex gap-[2px] bg-primary px-1 py-1 rounded-md border border-secondary shadow-md">
            {UNDO_ACTIONS.map(({ icon, onClick, disabled, message }) => (
              <ToolbarAction
                key={message}
                icon={icon}
                onClick={onClick}
                disabled={disabled}
                message={message}
              ></ToolbarAction>
            ))}
          </div>
        </motion.div>
        <motion.div
          role="toolbar"
          transition={{
            type: "spring",
            duration: 0.5,
            bounce: 0.15,
          }}
          initial={{ y: 75 }}
          animate={{ y: -16 }}
          className=" absolute right-4 bottom-0 m-auto w-fit flex gap-[2px] bg-primary px-1 py-1 rounded-md border border-secondary shadow-md"
        >
          {STYLING_ACTIONS.map(({ icon, onClick, disabled, message }) => (
            <ToolbarAction
              key={message}
              icon={icon}
              onClick={onClick}
              disabled={disabled}
              message={message}
            ></ToolbarAction>
          ))}
        </motion.div>
      </TooltipProvider>
    </>
  );
}
