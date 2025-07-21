import { usePathObject } from "@/context/PathContext";
import { Redo, Undo } from "lucide-react";
import { motion } from "motion/react";

export default function SvgActions() {
  const {
    undoUtils: { undoStack, redoStack, handleUndo, handleRedo },
  } = usePathObject();

  const undoStackIsEmpty = undoStack.length <= 0;
  const redoStackIsEmpty = redoStack.length <= 0;
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
      <button
        onClick={handleUndo}
        disabled={undoStackIsEmpty}
        className=" px-1 py-1 rounded-sm h-10 w-10 flex items-center justify-center text-tertiary hover:bg-secondary transition-[background-color,opacity] disabled:opacity-50"
      >
        <Undo></Undo>
      </button>
      <button
        onClick={handleRedo}
        disabled={redoStackIsEmpty}
        className=" px-1 py-1 rounded-sm h-10 w-10 flex items-center justify-center text-tertiary hover:bg-secondary transition-[background-color,opacity] disabled:opacity-50"
      >
        <Redo></Redo>
      </button>
    </motion.div>
  );
}
